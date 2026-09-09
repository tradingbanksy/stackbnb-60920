-- Critical Finding #3 remediation
-- Remove direct authenticated vendor UPDATE access to public.bookings entirely.
--
-- Read-only impact analysis confirmed that no current application code path relies
-- on this policy: every legitimate booking status transition (guest/vendor/host
-- cancellation, admin refund, scheduled payout release, reminder tracking) is
-- performed by an Edge Function using the Supabase service-role key, which bypasses
-- RLS entirely. The policy's WITH CHECK also failed to pin host_user_id,
-- booking_date, booking_time, guests, experience_name, and vendor_name to their
-- prior values, allowing a vendor to mutate those fields (and reassign
-- vendor_profile_id among their own listings, or set status to any value at any
-- time) even though the direct monetary/identifier columns were already locked.
--
-- No replacement policy is added: with no INSERT/UPDATE policy present for the
-- authenticated role, RLS defaults to deny, and all legitimate writes continue to
-- work unaffected via the service-role Edge Functions listed above.

DROP POLICY IF EXISTS "Vendors can update booking status only" ON public.bookings;
