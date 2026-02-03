

# Plan: Update CORS Headers for Remaining Stripe Functions

## Summary
Update the CORS configuration in `create-booking-checkout` and `stripe-webhook` Edge Functions to match the already-fixed functions, ensuring consistent behavior across all Stripe-related endpoints.

## Changes Required

### 1. Update `create-booking-checkout/index.ts`

Replace the dynamic CORS configuration (lines 5-17 and 24-26):
```typescript
// OLD - remove this
const allowedOrigins = [...]
const getCorsHeaders = (origin: string | null) => {...}
...
const origin = req.headers.get('origin');
const corsHeaders = getCorsHeaders(origin);
```

With the standardized CORS headers:
```typescript
// NEW - use this
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
```

### 2. Update `stripe-webhook/index.ts`

Same change - replace lines 5-17 and 24-26 with the standardized CORS headers.

Note: For webhooks, the `stripe-signature` header should still be included in the allowed headers for signature verification.

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
```

### 3. Redeploy Functions

After the code changes, both functions will be automatically redeployed.

## Technical Notes

- All 5 Stripe functions already correctly use `Deno.env.get("STRIPE_SECRET_KEY")` - no changes needed for the API key itself
- The new secret value you just updated will be used automatically by all functions
- The CORS fix ensures the frontend can successfully call these functions without browser blocking

## Files to Modify
1. `supabase/functions/create-booking-checkout/index.ts`
2. `supabase/functions/stripe-webhook/index.ts`

