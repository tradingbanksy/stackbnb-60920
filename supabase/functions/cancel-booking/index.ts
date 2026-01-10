import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, reason } = await req.json();
    logStep("Cancellation request received", { bookingId, reason });

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      logStep("Booking not found", { error: bookingError?.message });
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled") {
      logStep("Booking already cancelled");
      return new Response(JSON.stringify({ success: true, message: "Booking already cancelled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update booking status
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      logStep("Failed to update booking", { error: updateError.message });
      throw updateError;
    }

    logStep("Booking cancelled successfully", { bookingId });

    // Get guest email
    const { data: guestUserData } = await supabaseAdmin.auth.admin.getUserById(booking.user_id);
    const guestEmail = guestUserData?.user?.email;

    // Get vendor email if applicable
    let vendorEmail: string | null = null;
    if (booking.vendor_profile_id) {
      const { data: vendorProfile } = await supabaseAdmin
        .from("vendor_profiles")
        .select("user_id")
        .eq("id", booking.vendor_profile_id)
        .single();

      if (vendorProfile?.user_id) {
        const { data: vendorUserData } = await supabaseAdmin.auth.admin.getUserById(vendorProfile.user_id);
        vendorEmail = vendorUserData?.user?.email || null;
      }
    }

    // Send guest cancellation notification
    if (guestEmail) {
      try {
        const guestPayload = {
          type: "guest_cancellation",
          guestEmail,
          experienceName: booking.experience_name,
          vendorName: booking.vendor_name,
          date: booking.booking_date,
          time: booking.booking_time,
          guests: booking.guests,
          totalAmount: booking.total_amount,
          currency: booking.currency,
          reason: reason || "No reason provided",
        };

        await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify(guestPayload),
          }
        );
        logStep("Guest cancellation email sent", { guestEmail });
      } catch (error) {
        logStep("Guest cancellation email failed", { error: String(error) });
      }
    }

    // Send vendor cancellation notification
    if (vendorEmail) {
      try {
        const vendorPayload = {
          type: "vendor_cancellation",
          vendorEmail,
          guestEmail,
          experienceName: booking.experience_name,
          date: booking.booking_date,
          time: booking.booking_time,
          guests: booking.guests,
          totalAmount: booking.total_amount,
          vendorPayoutAmount: booking.vendor_payout_amount,
          currency: booking.currency,
          reason: reason || "No reason provided",
        };

        await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-admin-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify(vendorPayload),
          }
        );
        logStep("Vendor cancellation email sent", { vendorEmail });
      } catch (error) {
        logStep("Vendor cancellation email failed", { error: String(error) });
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Booking cancelled" }), {
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
