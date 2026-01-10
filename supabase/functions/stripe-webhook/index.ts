import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://stackbnb-60920.lovable.app',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (allowedOrigins.includes(origin) || origin.endsWith('.lovable.app'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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
      const vendorName = metadata.vendor_name || null;
      const bookingDate = metadata.date || "";
      const bookingTime = metadata.time || "";
      const guests = parseInt(metadata.guests || "1", 10);
      const userId = metadata.user_id;
      const hostUserId = metadata.host_user_id || null;
      
      // Payment split amounts (stored in cents in metadata)
      const platformFeeCents = parseInt(metadata.platform_fee_cents || "0", 10);
      const vendorPayoutCents = parseInt(metadata.vendor_payout_cents || "0", 10);
      const hostPayoutCents = parseInt(metadata.host_payout_cents || "0", 10);

      logStep("Session metadata", { 
        vendorId, experienceName, bookingDate, bookingTime, guests, userId,
        platformFeeCents, vendorPayoutCents, hostPayoutCents, hostUserId
      });

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

      // Insert the booking with payout information
      const { data: booking, error: insertError } = await supabaseAdmin
        .from("bookings")
        .insert({
          user_id: userId,
          vendor_profile_id: vendorId || null,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          experience_name: experienceName,
          vendor_name: vendorName,
          booking_date: bookingDate,
          booking_time: bookingTime,
          guests: guests,
          total_amount: (session.amount_total || 0) / 100, // Convert from cents
          currency: session.currency || "usd",
          status: "completed",
          vendor_payout_amount: vendorPayoutCents / 100,
          host_payout_amount: hostPayoutCents / 100,
          platform_fee_amount: platformFeeCents / 100,
          payout_status: hostPayoutCents > 0 ? "pending" : "processed",
          host_user_id: hostUserId || null,
        })
        .select()
        .single();

      if (insertError) {
        logStep("Failed to insert booking", { error: insertError.message });
        throw insertError;
      }

      logStep("Booking created successfully", { bookingId: booking.id });

      // Get user email for notification
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const guestEmail = userData?.user?.email || metadata.guest_email;

      // Send admin notification
      try {
        const notificationPayload = {
          type: "booking",
          experienceName,
          vendorName,
          guestEmail,
          date: bookingDate,
          time: bookingTime,
          guests,
          totalAmount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          promoCode: metadata.promo_code || null,
          discountAmount: metadata.discount_amount ? parseFloat(metadata.discount_amount) : null,
          originalAmount: metadata.original_amount ? parseFloat(metadata.original_amount) : null,
        };

        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify(notificationPayload),
          }
        );

        if (response.ok) {
          logStep("Admin notification sent");
        } else {
          const errorText = await response.text();
          logStep("Admin notification failed", { error: errorText });
        }
      } catch (notifError) {
        const notifErrorMsg = notifError instanceof Error ? notifError.message : String(notifError);
        logStep("Admin notification error", { error: notifErrorMsg });
        // Don't fail the webhook for notification errors
      }

      // Send vendor notification
      if (vendorId) {
        try {
          // Get vendor's email from vendor_profiles
          const { data: vendorProfile } = await supabaseAdmin
            .from("vendor_profiles")
            .select("user_id")
            .eq("id", vendorId)
            .single();

          if (vendorProfile?.user_id) {
            const { data: vendorUserData } = await supabaseAdmin.auth.admin.getUserById(vendorProfile.user_id);
            const vendorEmail = vendorUserData?.user?.email;

            if (vendorEmail) {
              const vendorNotificationPayload = {
                type: "vendor_booking",
                vendorEmail,
                experienceName,
                guestEmail,
                date: bookingDate,
                time: bookingTime,
                guests,
                totalAmount: (session.amount_total || 0) / 100,
                vendorPayoutAmount: vendorPayoutCents / 100,
                currency: session.currency || "usd",
              };

              const vendorNotifResponse = await fetch(
                `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-notification`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  },
                  body: JSON.stringify(vendorNotificationPayload),
                }
              );

              if (vendorNotifResponse.ok) {
                logStep("Vendor notification sent", { vendorEmail });
              } else {
                const errorText = await vendorNotifResponse.text();
                logStep("Vendor notification failed", { error: errorText });
              }
            }
          }
        } catch (vendorNotifError) {
          const vendorNotifErrorMsg = vendorNotifError instanceof Error ? vendorNotifError.message : String(vendorNotifError);
          logStep("Vendor notification error", { error: vendorNotifErrorMsg });
          // Don't fail the webhook for notification errors
        }
      }

      // Send guest confirmation email
      if (guestEmail) {
        try {
          const guestNotificationPayload = {
            type: "guest_confirmation",
            guestEmail,
            guestName: metadata.guest_name || null,
            experienceName,
            vendorName,
            date: bookingDate,
            time: bookingTime,
            guests,
            totalAmount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
            promoCode: metadata.promo_code || null,
            discountAmount: metadata.discount_amount ? parseFloat(metadata.discount_amount) : null,
            originalAmount: metadata.original_amount ? parseFloat(metadata.original_amount) : null,
          };

          const guestNotifResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-notification`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify(guestNotificationPayload),
            }
          );

          if (guestNotifResponse.ok) {
            logStep("Guest confirmation email sent", { guestEmail });
          } else {
            const errorText = await guestNotifResponse.text();
            logStep("Guest confirmation email failed", { error: errorText });
          }
        } catch (guestNotifError) {
          const guestNotifErrorMsg = guestNotifError instanceof Error ? guestNotifError.message : String(guestNotifError);
          logStep("Guest confirmation email error", { error: guestNotifErrorMsg });
          // Don't fail the webhook for notification errors
        }
      }

      // Transfer host's portion if applicable
      if (hostUserId && hostPayoutCents > 0) {
        // Get host's Stripe account and email
        const { data: hostProfile } = await supabaseAdmin
          .from("profiles")
          .select("stripe_account_id, stripe_onboarding_complete")
          .eq("user_id", hostUserId)
          .single();

        // Get host email for notification
        const { data: hostUserData } = await supabaseAdmin.auth.admin.getUserById(hostUserId);
        const hostEmail = hostUserData?.user?.email;

        if (hostProfile?.stripe_account_id && hostProfile?.stripe_onboarding_complete) {
          try {
            // Create a transfer to the host from the application fee
            const transfer = await stripe.transfers.create({
              amount: hostPayoutCents,
              currency: session.currency || "usd",
              destination: hostProfile.stripe_account_id,
              transfer_group: session.id,
              metadata: {
                booking_id: booking.id,
                type: "host_commission",
              },
            });
            logStep("Host transfer created", { transferId: transfer.id, amount: hostPayoutCents });

            // Update booking payout status
            await supabaseAdmin
              .from("bookings")
              .update({ payout_status: "processed" })
              .eq("id", booking.id);
          } catch (transferError) {
            const errorMsg = transferError instanceof Error ? transferError.message : String(transferError);
            logStep("Host transfer failed", { error: errorMsg });
            // Don't fail the webhook, just log the error
          }
        } else {
          logStep("Host not set up for Stripe Connect, skipping transfer", { hostUserId });
        }

        // Send host commission notification
        if (hostEmail) {
          try {
            const hostNotificationPayload = {
              type: "host_commission",
              hostEmail,
              experienceName,
              vendorName,
              date: bookingDate,
              time: bookingTime,
              guests,
              totalAmount: (session.amount_total || 0) / 100,
              hostPayoutAmount: hostPayoutCents / 100,
              currency: session.currency || "usd",
            };

            const hostNotifResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-notification`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify(hostNotificationPayload),
              }
            );

            if (hostNotifResponse.ok) {
              logStep("Host commission notification sent", { hostEmail });
            } else {
              const errorText = await hostNotifResponse.text();
              logStep("Host commission notification failed", { error: errorText });
            }
          } catch (hostNotifError) {
            const hostNotifErrorMsg = hostNotifError instanceof Error ? hostNotifError.message : String(hostNotifError);
            logStep("Host commission notification error", { error: hostNotifErrorMsg });
            // Don't fail the webhook for notification errors
          }
        }
      }
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
