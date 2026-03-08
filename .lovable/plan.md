

# Deep Security Review Findings

## Summary

After reviewing all edge functions, RLS policies, client-side code, and the automated scan results, here are the findings organized by severity.

---

## CRITICAL Findings

### 1. Mapbox Token Leaked to Client via API Response
**File:** `supabase/functions/mapbox-directions/index.ts` (line 72)
The `MAPBOX_PUBLIC_TOKEN` secret is passed in the API response body (`mapboxToken: mapboxToken`) and used directly on the client in `VendorLocationMap.tsx` (line 188, 255). While Mapbox tokens are technically "public," this one is stored as a secret for a reason — anyone inspecting network responses gets it. This is the same pattern we just fixed for Google Maps.

**Fix:** Keep the Mapbox token server-side. Either render map tiles via a proxy, or accept that this token is intentionally public and move it to a `VITE_` env var instead of treating it as a secret (Mapbox tokens can be URL-restricted).

### 2. `assign-role` Allows Any User to Self-Escalate to Host/Vendor
**File:** `supabase/functions/assign-role/index.ts` (lines 46-53)
Any authenticated user can call this function and assign themselves the `host` or `vendor` role. There is no check for whether the user is *allowed* to become a host or vendor. A malicious user can call `supabase.functions.invoke('assign-role', { body: { role: 'host' } })` and immediately gain host privileges, access vendor profiles via the "Hosts can view linked vendor profiles" policy, and create host-vendor links.

**Fix:** Add authorization logic — e.g., only allow escalation to `host` if the user was invited or approved, or only allow `vendor` if they've completed onboarding. At minimum, prevent switching *from* host/vendor to another role without admin approval.

### 3. `itineraries_public` View Exposes All Itineraries (Including Private)
**File:** Scan finding — the view has no `WHERE is_public = true` filter.
Since the view is owned by a privileged role (likely `postgres`), it bypasses RLS on the `itineraries` table and exposes all rows, including private itineraries with their `share_token` values. Leaked share tokens grant access to shared itinerary content.

**Fix:** Add `WHERE is_public = true` to the view definition.

### 4. `vendor_profiles_public` View Exposes Unpublished/Draft Profiles
**File:** Scan finding — the view has no `WHERE is_published = true` filter.
Draft, rejected, and pending-review vendor profiles are visible to anyone querying this view.

**Fix:** Add `WHERE is_published = true AND verification_status = 'verified'` to the view definition.

---

## HIGH Findings

### 5. Stripe Webhook Bypasses Signature Verification When Secret is Missing
**File:** `supabase/functions/stripe-webhook/index.ts` (lines 40-57)
If `STRIPE_WEBHOOK_SECRET` is not set or the `stripe-signature` header is missing, the webhook falls through to `JSON.parse(body)` with no verification. This means anyone can POST a fake `checkout.session.completed` event and create fraudulent bookings with arbitrary amounts.

**Fix:** Make signature verification mandatory — fail if `STRIPE_WEBHOOK_SECRET` is not set or if the signature is missing/invalid. Remove the testing fallback.

### 6. `send-admin-notification` Has No Authentication
**File:** `supabase/functions/send-admin-notification/index.ts`
This function has no JWT verification and no auth check. While it's called internally from other functions using the service role key, the function itself is publicly accessible. Anyone could call it directly to send spam emails through your Resend account.

**Fix:** Add auth verification — either require the service role key in the Authorization header, or set `verify_jwt = true` in config.toml and only call it from other functions using the service role.

### 7. `verify-reset-otp` Returns a Password Reset Link in the Response Body
**File:** `supabase/functions/verify-reset-otp/index.ts` (line 111)
The action link is returned directly to the client. If an attacker intercepts or brute-forces the OTP (5 attempts/minute is relatively generous), they get a direct password reset link. The link should be consumed server-side or the user should be redirected rather than exposing the raw link.

---

## MEDIUM Findings

### 8. `send-reset-otp` Loads All Users to Check Email Existence
**File:** `supabase/functions/send-reset-otp/index.ts` (line 70)
`listUsers()` loads the entire user list into memory to check if an email exists. This is a performance issue that becomes a DoS vector at scale. Use `getUserByEmail` or a filtered query instead.

### 9. Hosts Can See Vendor `stripe_account_id` via RLS Policy
**File:** Scan finding — "Hosts can view linked vendor profiles" grants full SELECT on `vendor_profiles`.
Hosts with a `host_vendor_links` entry can read `stripe_account_id`, `commission_percentage`, and `verification_notes` for their linked vendors. These are sensitive business fields.

**Fix:** Create a restricted view for host access that excludes sensitive columns.

### 10. `generate-reset-link` Returns Raw Recovery Link (Development Endpoint)
**File:** `supabase/functions/generate-reset-link/index.ts`
This appears to be a development/debug endpoint that returns a raw password reset link with no OTP verification. It should be removed or disabled in production.

---

## LOW Findings

### 11. OTP Generated with `Math.random()` (Not Cryptographically Secure)
**File:** `supabase/functions/send-reset-otp/index.ts` (line 24)
`Math.random()` is not cryptographically secure. Use `crypto.getRandomValues()` for OTP generation.

### 12. Inconsistent CORS Policies Across Edge Functions
Some functions use `'*'` for CORS origin (stripe-webhook, google-places, etc.) while others restrict to specific origins (trip-planner-chat, send-reset-otp). Security-sensitive functions like password reset should not use `'*'`.

---

## Implementation Plan

### Migration 1: Fix public views
```sql
-- Recreate itineraries_public with WHERE filter
CREATE OR REPLACE VIEW itineraries_public AS
  SELECT id, start_date, end_date, itinerary_data, is_confirmed,
         share_token, is_public, created_at, updated_at, destination
  FROM itineraries
  WHERE is_public = true;

-- Recreate vendor_profiles_public with WHERE filter  
CREATE OR REPLACE VIEW vendor_profiles_public AS
  SELECT id, name, category, description, about_experience, photos, ...
  FROM vendor_profiles
  WHERE is_published = true AND verification_status = 'verified';
```

### Code changes:
1. **Stripe webhook** — Remove the no-signature fallback, require `STRIPE_WEBHOOK_SECRET`
2. **assign-role** — Add guard preventing self-escalation to host/vendor without approval
3. **send-admin-notification** — Add service-role-only auth check
4. **mapbox-directions** — Stop returning `mapboxToken` in response; create a separate proxy or use a restricted public token
5. **verify-reset-otp** — Consume the reset link server-side instead of returning it
6. **send-reset-otp** — Replace `listUsers()` with targeted lookup; use `crypto.getRandomValues()` for OTP
7. **generate-reset-link** — Remove or disable this development endpoint

Shall I proceed with fixing all of these?

