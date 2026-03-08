import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RELEASE-PAYOUTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting payout release check");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find confirmed bookings with held payouts where experience date+time is 24h+ ago
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const cutoffDate = cutoffTime.toISOString().split('T')[0];

    logStep("Looking for bookings to release", { cutoffDate, now: now.toISOString() });

    // Get all confirmed bookings with held payouts on or before the cutoff date
    const { data: bookings, error: queryError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .eq("payout_status", "held")
      .lte("booking_date", cutoffDate);

    if (queryError) {
      logStep("Query error", { error: queryError.message });
      throw queryError;
    }

    logStep("Found candidate bookings", { count: bookings?.length || 0 });

    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ success: true, released: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let released = 0;
    let errors = 0;

    for (const booking of bookings) {
      try {
        // Parse booking datetime and verify 24h has passed
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time || '23:59'}:00`);
        const hoursSinceBooking = (now.getTime() - bookingDateTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceBooking < 24) {
          logStep("Skipping - less than 24h since experience", { bookingId: booking.id, hoursSinceBooking });
          continue;
        }

        logStep("Processing payout release", { bookingId: booking.id, hoursSinceBooking });

        const vendorPayoutCents = Math.round((booking.vendor_payout_amount || 0) * 100);
        const hostPayoutCents = Math.round((booking.host_payout_amount || 0) * 100);

        // Transfer to vendor
        if (vendorPayoutCents > 0 && booking.vendor_profile_id) {
          const { data: vendorProfile } = await supabaseAdmin
            .from("vendor_profiles")
            .select("stripe_account_id, stripe_onboarding_complete")
            .eq("id", booking.vendor_profile_id)
            .single();

          if (vendorProfile?.stripe_account_id && vendorProfile?.stripe_onboarding_complete) {
            const transfer = await stripe.transfers.create({
              amount: vendorPayoutCents,
              currency: booking.currency || "usd",
              destination: vendorProfile.stripe_account_id,
              transfer_group: booking.stripe_session_id || booking.id,
              metadata: {
                booking_id: booking.id,
                type: "vendor_payout",
              },
            });
            logStep("Vendor transfer created", { transferId: transfer.id, amount: vendorPayoutCents });
          } else {
            logStep("Vendor not set up for Stripe Connect, skipping vendor transfer", { bookingId: booking.id });
          }
        }

        // Transfer to host
        if (hostPayoutCents > 0 && booking.host_user_id) {
          const { data: hostProfile } = await supabaseAdmin
            .from("profiles")
            .select("stripe_account_id, stripe_onboarding_complete")
            .eq("user_id", booking.host_user_id)
            .single();

          if (hostProfile?.stripe_account_id && hostProfile?.stripe_onboarding_complete) {
            const transfer = await stripe.transfers.create({
              amount: hostPayoutCents,
              currency: booking.currency || "usd",
              destination: hostProfile.stripe_account_id,
              transfer_group: booking.stripe_session_id || booking.id,
              metadata: {
                booking_id: booking.id,
                type: "host_commission",
              },
            });
            logStep("Host transfer created", { transferId: transfer.id, amount: hostPayoutCents });
          } else {
            logStep("Host not set up for Stripe Connect, skipping host transfer", { bookingId: booking.id });
          }
        }

        // Update booking: status = completed, payout_status = processed
        await supabaseAdmin
          .from("bookings")
          .update({ 
            status: "completed",
            payout_status: "processed",
          })
          .eq("id", booking.id);

        logStep("Booking completed and payouts released", { bookingId: booking.id });
        released++;
      } catch (bookingError) {
        const errorMsg = bookingError instanceof Error ? bookingError.message : String(bookingError);
        logStep("Error processing booking", { bookingId: booking.id, error: errorMsg });
        
        // Mark as failed but don't block other bookings
        await supabaseAdmin
          .from("bookings")
          .update({ payout_status: "failed" })
          .eq("id", booking.id);
        
        errors++;
      }
    }

    logStep("Completed", { released, errors, total: bookings.length });

    return new Response(JSON.stringify({ success: true, released, errors }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});