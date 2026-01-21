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
    // 1. Check authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("Authentication required - no auth header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify user with the auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      logStep("Invalid authentication", { error: claimsError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    logStep("User authenticated", { userId });

    const { bookingId, reason, guestCancellation } = await req.json();
    logStep("Cancellation request received", { bookingId, reason, guestCancellation, userId });

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    // 3. Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 4. Get booking details with vendor profile user_id for authorization check
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*, vendor_profiles(user_id)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      logStep("Booking not found", { error: bookingError?.message });
      throw new Error("Booking not found");
    }

    // 5. Authorization check: only booking owner, vendor, or host can cancel
    const isBookingOwner = booking.user_id === userId;
    const isVendor = booking.vendor_profiles?.user_id === userId;
    const isHost = booking.host_user_id === userId;

    if (!isBookingOwner && !isVendor && !isHost) {
      logStep("Authorization denied", { 
        userId, 
        bookingUserId: booking.user_id, 
        vendorUserId: booking.vendor_profiles?.user_id,
        hostUserId: booking.host_user_id
      });
      return new Response(
        JSON.stringify({ error: "You are not authorized to cancel this booking" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Authorization granted", { isBookingOwner, isVendor, isHost });

    if (booking.status === "cancelled") {
      logStep("Booking already cancelled");
      return new Response(JSON.stringify({ success: true, message: "Booking already cancelled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If this is a guest-initiated cancellation, check the vendor's cancellation policy
    // Only enforce cancellation window for guests, not vendors/hosts
    if (guestCancellation && isBookingOwner && booking.vendor_profile_id) {
      const { data: vendorProfile, error: vendorError } = await supabaseAdmin
        .from("vendor_profiles")
        .select("cancellation_hours, name")
        .eq("id", booking.vendor_profile_id)
        .single();

      if (vendorError) {
        logStep("Failed to fetch vendor profile", { error: vendorError.message });
        throw new Error("Failed to verify cancellation policy");
      }

      const cancellationHours = vendorProfile?.cancellation_hours ?? 24;
      
      // Parse booking date and time to create a datetime
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time || '00:00'}:00`);
      const now = new Date();
      const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      logStep("Checking cancellation window", { 
        bookingDateTime: bookingDateTime.toISOString(), 
        now: now.toISOString(),
        hoursUntilBooking,
        cancellationHours
      });

      if (hoursUntilBooking < cancellationHours) {
        const message = `Cancellation is not allowed within ${cancellationHours} hours of the booking. Your booking is in ${Math.max(0, Math.floor(hoursUntilBooking))} hours.`;
        logStep("Cancellation denied - within policy window", { message });
        return new Response(JSON.stringify({ 
          success: false, 
          error: "CANCELLATION_WINDOW_EXPIRED",
          message,
          cancellationHours,
          hoursUntilBooking: Math.floor(hoursUntilBooking)
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    logStep("Booking cancelled successfully", { bookingId, cancelledBy: userId });

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
