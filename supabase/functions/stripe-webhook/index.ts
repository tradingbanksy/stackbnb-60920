import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is set
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logStep("Webhook signature verification failed", { error: errorMessage });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // For testing without signature verification
      event = JSON.parse(body);
      logStep("Webhook received without signature verification (testing mode)");
    }

    logStep("Event type", { type: event.type });

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout session", { sessionId: session.id });

      // Create Supabase client with service role for inserting
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Extract metadata from the session
      const metadata = session.metadata || {};
      const vendorId = metadata.vendor_id;
      const experienceName = metadata.experience_name || "Experience";
      const bookingDate = metadata.date || "";
      const bookingTime = metadata.time || "";
      const guests = parseInt(metadata.guests || "1", 10);
      const userId = metadata.user_id;

      logStep("Session metadata", { vendorId, experienceName, bookingDate, bookingTime, guests, userId });

      if (!userId) {
        logStep("No user_id in metadata, skipping booking creation");
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Check if booking already exists (idempotency)
      const { data: existingBooking } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("stripe_session_id", session.id)
        .single();

      if (existingBooking) {
        logStep("Booking already exists", { bookingId: existingBooking.id });
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Insert the booking
      const { data: booking, error: insertError } = await supabaseAdmin
        .from("bookings")
        .insert({
          user_id: userId,
          vendor_profile_id: vendorId || null,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          experience_name: experienceName,
          vendor_name: metadata.vendor_name || null,
          booking_date: bookingDate,
          booking_time: bookingTime,
          guests: guests,
          total_amount: (session.amount_total || 0) / 100, // Convert from cents
          currency: session.currency || "usd",
          status: "completed",
        })
        .select()
        .single();

      if (insertError) {
        logStep("Failed to insert booking", { error: insertError.message });
        throw insertError;
      }

      logStep("Booking created successfully", { bookingId: booking.id });
    }

    return new Response(JSON.stringify({ received: true }), {
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
