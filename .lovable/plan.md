

# Plan: Fix Vendor Contact Info and Travel Plans Security Issues

## Summary

The security scan identified 4 critical/warning-level vulnerabilities related to data exposure. This plan addresses all of them to protect vendor contact information, business data, and guest travel plans.

## Issues to Fix

| Issue | Severity | Description |
|-------|----------|-------------|
| Vendor profiles exposure | ERROR | Sensitive fields (stripe_account_id, commission rates, user_id) exposed via public RLS policy |
| Itinerary userId in public data | ERROR | The `itinerary_data` JSONB stores `userId` which is visible in public shared itineraries |
| Promo codes discoverable | WARN | All active promo codes can be listed by anyone, allowing discovery of unlisted codes |
| Leaked password protection | WARN | Users can set passwords from known data breaches |

## Solution Overview

### Phase 1: Protect Vendor Business Data

The `vendor_profiles_public` view already exists and excludes sensitive fields. However, the application code queries the base table directly.

**Changes:**
1. Update guest-facing pages to query `vendor_profiles_public` view instead of `vendor_profiles` table
2. Add RLS policy to deny direct SELECT on `vendor_profiles` base table for anonymous users
3. Keep authenticated owner access to their own full vendor profile

**Files to modify:**
- `src/pages/guest/Explore.tsx` - Change to use `vendor_profiles_public`
- `src/pages/guest/AppView.tsx` - Change to use `vendor_profiles_public`
- `src/pages/vendor/PublicProfile.tsx` - Change to use `vendor_profiles_public`
- Database migration - Add deny policy for anon users on base table

### Phase 2: Sanitize Public Itinerary Data

When itineraries are shared publicly, the `itinerary_data` JSONB includes the owner's `userId`. This should be stripped before public display.

**Changes:**
1. Create a `sanitize_itinerary_for_public` database function that removes `userId` from JSONB
2. Update the itinerary sync hook to strip `userId` when loading shared itineraries
3. Alternatively, update the save function to never include `userId` in the stored `itinerary_data`

**Files to modify:**
- `src/features/trip-planner/hooks/useItinerarySync.ts` - Strip userId on public load
- `src/pages/guest/SharedItinerary.tsx` - Ensure userId not exposed in UI

### Phase 3: Secure Promo Code Validation

Currently, anyone can SELECT all active promo codes. This allows discovering unlisted promotional codes.

**Changes:**
1. Create an Edge Function `validate-promo-code` that validates a single code without exposing the full list
2. Update RLS policy to deny direct SELECT on `promo_codes` for non-admins
3. Update frontend to call Edge Function instead of querying directly

**Files to modify:**
- Create `supabase/functions/validate-promo-code/index.ts`
- Database migration - Update RLS policy
- Find and update any frontend promo code validation logic

### Phase 4: Enable Leaked Password Protection

This is a dashboard configuration change, not a code change.

**Action:** Enable "Leaked Password Protection" in the backend authentication settings.

**Code change:** Add error handling for leaked password errors in signup/password change flows.

**Files to modify:**
- `src/pages/auth/Auth.tsx` - Handle leaked password error message
- `src/pages/auth/ChangePassword.tsx` - Handle leaked password error message

## Technical Details

### Vendor Profiles Query Changes

Current (vulnerable):
```typescript
// src/pages/vendor/PublicProfile.tsx
const { data } = await supabase
  .from('vendor_profiles')
  .select('*')  // Includes stripe_account_id, commission, etc.
  .eq('id', id)
  .eq('is_published', true)
```

Fixed:
```typescript
const { data } = await supabase
  .from('vendor_profiles_public')  // Uses restricted view
  .select('*')  // Only returns public-safe fields
  .eq('id', id)
  .eq('is_published', true)
```

### Itinerary Data Sanitization

When loading a public itinerary, strip sensitive fields:
```typescript
function sanitizeItineraryForPublic(itinerary: Itinerary): Itinerary {
  return {
    ...itinerary,
    userId: undefined,  // Remove owner identification
  };
}
```

### Promo Code Edge Function

```typescript
// supabase/functions/validate-promo-code/index.ts
// Validates a single code server-side without exposing the full list
const result = await supabase.rpc('validate_promo_code', {
  p_code: code,
  p_order_amount: orderAmount
});
```

### Database Migration

```sql
-- Deny anonymous users from directly querying vendor_profiles
CREATE POLICY "Deny anon access to vendor_profiles"
  ON public.vendor_profiles
  FOR SELECT
  TO anon
  USING (false);

-- Update promo_codes policy to only allow validation via RPC
DROP POLICY "Anyone can validate promo codes" ON public.promo_codes;
CREATE POLICY "Only admins can view promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/guest/Explore.tsx` | Query `vendor_profiles_public` instead of `vendor_profiles` |
| `src/pages/guest/AppView.tsx` | Query `vendor_profiles_public` instead of `vendor_profiles` |
| `src/pages/vendor/PublicProfile.tsx` | Query `vendor_profiles_public` instead of `vendor_profiles` |
| `src/features/trip-planner/hooks/useItinerarySync.ts` | Strip userId when loading public itineraries |
| `src/pages/guest/SharedItinerary.tsx` | Ensure userId not displayed |
| `src/pages/auth/Auth.tsx` | Handle leaked password error gracefully |
| `src/pages/auth/ChangePassword.tsx` | Handle leaked password error gracefully |
| New: `supabase/functions/validate-promo-code/index.ts` | Server-side promo validation |
| Database migration | Add deny policies, update promo code access |

## Security Improvements

After implementation:
- Anonymous users cannot access vendor Stripe IDs, commissions, or user IDs
- Public itineraries won't expose owner identity
- Promo codes cannot be enumerated/discovered
- Users protected from using known breached passwords

