import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOOKING-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { 
      experienceName, 
      vendorName, 
      date, 
      time, 
      guests, 
      totalPrice,
      vendorId 
    } = await req.json();

    logStep("Booking details received", { experienceName, vendorName, date, time, guests, totalPrice, vendorId });

    // Validate required fields
    if (!experienceName || !totalPrice || totalPrice <= 0) {
      throw new Error("Invalid booking details");
    }

    // Get vendor profile with Stripe Connect info and commission settings
    const { data: vendorProfile, error: vendorError } = await supabaseAdmin
      .from("vendor_profiles")
      .select("stripe_account_id, stripe_onboarding_complete, host_user_id, host_commission_percentage, commission_percentage")
      .eq("id", vendorId)
      .single();

    if (vendorError) {
      logStep("Error fetching vendor profile", { error: vendorError.message });
    }

    logStep("Vendor profile", vendorProfile);

    // Get platform fee percentage
    const { data: platformSettings } = await supabaseAdmin
      .from("platform_settings")
      .select("platform_fee_percentage")
      .single();

    const platformFeePercent = platformSettings?.platform_fee_percentage || 10;
    logStep("Platform fee percentage", { platformFeePercent });

    // Get host's Stripe account if there's a host
    let hostStripeAccountId: string | null = null;
    if (vendorProfile?.host_user_id) {
      const { data: hostProfile } = await supabaseAdmin
        .from("profiles")
        .select("stripe_account_id, stripe_onboarding_complete")
        .eq("user_id", vendorProfile.host_user_id)
        .single();

      if (hostProfile?.stripe_onboarding_complete) {
        hostStripeAccountId = hostProfile.stripe_account_id;
      }
      logStep("Host profile", { hostStripeAccountId, onboardingComplete: hostProfile?.stripe_onboarding_complete });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    // Calculate payment splits
    const totalAmountCents = Math.round(totalPrice * 100);
    const platformFeeCents = Math.round(totalAmountCents * (platformFeePercent / 100));
    
    const hostCommissionPercent = vendorProfile?.host_commission_percentage || 15;
    const hostPayoutCents = Math.round(totalAmountCents * (hostCommissionPercent / 100));
    
    // Vendor gets remainder after platform fee and host commission
    const vendorPayoutCents = totalAmountCents - platformFeeCents - hostPayoutCents;

    logStep("Payment splits calculated", {
      totalAmountCents,
      platformFeeCents,
      hostPayoutCents,
      vendorPayoutCents,
      platformFeePercent,
      hostCommissionPercent
    });

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Build session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: experienceName,
              description: `${vendorName} - ${date} at ${time} for ${guests} guest${guests > 1 ? 's' : ''}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/booking/${vendorId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vendor/${vendorId}/payment`,
      metadata: {
        vendor_id: vendorId,
        vendor_name: vendorName,
        experience_name: experienceName,
        date: date,
        time: time,
        guests: guests.toString(),
        user_id: user.id,
        platform_fee_cents: platformFeeCents.toString(),
        vendor_payout_cents: vendorPayoutCents.toString(),
        host_payout_cents: hostPayoutCents.toString(),
        host_user_id: vendorProfile?.host_user_id || "",
      },
    };

    // If vendor has Stripe Connect set up, use payment_intent_data for transfers
    if (vendorProfile?.stripe_account_id && vendorProfile?.stripe_onboarding_complete) {
      // Calculate application fee (platform keeps this)
      // The vendor receives the payment, we take our cut + host cut as application fee
      // Then we'll transfer host cut to host separately via webhook
      sessionConfig.payment_intent_data = {
        application_fee_amount: platformFeeCents + hostPayoutCents,
        transfer_data: {
          destination: vendorProfile.stripe_account_id,
        },
      };
      logStep("Using Stripe Connect - vendor destination", { 
        vendorAccountId: vendorProfile.stripe_account_id,
        applicationFee: platformFeeCents + hostPayoutCents
      });
    } else {
      logStep("Vendor not using Stripe Connect - platform receives full payment");
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
