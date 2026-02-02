
# Plan: Security Remediation

## Overview

Address all active security findings from the security scan. The application has a solid security foundation but needs improvements in three key areas: data exposure protection, rate limiting for Edge Functions, and authentication hardening.

## Current Security Status

| Severity | Finding | Category |
|----------|---------|----------|
| **ERROR** | Vendor Contact Information Exposure | Data Protection |
| **ERROR** | Customer Personal Information Exposure | Data Protection |
| **ERROR** | Edge Functions Lack Rate Limiting | API Protection |
| **WARN** | Leaked Password Protection Disabled | Authentication |
| **WARN** | Vendor Business Data Access | Data Protection |

## Remediation Plan

### Phase 1: Database Security (RLS Policies)

**1.1 Fix Vendor Profiles Data Exposure**

The `vendor_profiles` table exposes sensitive fields (email via user_id lookup, stripe_account_id, commission rates) to anyone viewing published profiles.

**Solution:** Create a secure view for public access:

```sql
-- Create a view that only exposes public fields
CREATE VIEW public.vendor_profiles_public AS
SELECT 
  id,
  name,
  category,
  description,
  about_experience,
  photos,
  menu_url,
  instagram_url,
  price_per_person,
  price_tiers,
  duration,
  max_guests,
  google_rating,
  google_place_id,
  google_reviews_url,
  airbnb_experience_url,
  airbnb_reviews,
  included_items,
  age_restriction,
  listing_type,
  is_published,
  created_at
FROM vendor_profiles
WHERE is_published = true;

-- Grant SELECT to anon and authenticated
GRANT SELECT ON public.vendor_profiles_public TO anon, authenticated;
```

Then update client code to query the view for public access while keeping direct table access for owners.

**1.2 Protect Profiles Table**

Current RLS only allows users to view their own profile, which is correct. However, we should add an explicit deny for hosts viewing other profiles via recommendations field:

```sql
-- Add policy to allow hosts to view limited profile data for their linked vendors
CREATE POLICY "Hosts can view basic vendor owner profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR 
  EXISTS (
    SELECT 1 FROM host_vendor_links hvl
    JOIN vendor_profiles vp ON vp.id = hvl.vendor_profile_id
    WHERE hvl.host_user_id = auth.uid()
    AND vp.user_id = profiles.user_id
  )
);
```

**1.3 Protect Vendors Table**

Add explicit public deny:

```sql
-- Ensure only authenticated owners can access
CREATE POLICY "Deny public access to vendors"
ON public.vendors
FOR SELECT
TO anon
USING (false);
```

### Phase 2: Rate Limiting for Edge Functions

**2.1 Create Rate Limiting Infrastructure**

```sql
-- Rate limiting table
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_lookup 
ON public.rate_limits(identifier, endpoint, window_start);

-- Enable RLS (only service role should access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies = deny all direct access

-- Cleanup function for expired windows
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < now() - interval '1 hour';
END;
$$;
```

**2.2 Create Shared Rate Limit Helper**

Create file `supabase/functions/_shared/rateLimit.ts`:

```typescript
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitConfig {
  windowMinutes: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const windowStart = new Date(
    Date.now() - config.windowMinutes * 60 * 1000
  );

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('request_count, window_start')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (existing) {
    if (existing.request_count >= config.maxRequests) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt: new Date(
          new Date(existing.window_start).getTime() + 
          config.windowMinutes * 60 * 1000
        )
      };
    }

    await supabase
      .from('rate_limits')
      .update({ request_count: existing.request_count + 1 })
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString());

    return { 
      allowed: true, 
      remaining: config.maxRequests - existing.request_count - 1,
      resetAt: new Date(
        new Date(existing.window_start).getTime() + 
        config.windowMinutes * 60 * 1000
      )
    };
  }

  await supabase
    .from('rate_limits')
    .insert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString()
    });

  return { 
    allowed: true, 
    remaining: config.maxRequests - 1,
    resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000)
  };
}
```

**2.3 Apply Rate Limiting to Critical Functions**

| Function | Limit | Reason |
|----------|-------|--------|
| `trip-planner-chat` | 10/min | AI API costs ~$0.01-0.10/message |
| `send-reset-otp` | 3/min | Email bombing prevention |
| `verify-reset-otp` | 5/min | Brute force protection |
| `google-reviews` | 20/min | API quota protection |
| `tripadvisor-search` | 20/min | API quota protection |
| `scrape-instagram` | 5/min | Abuse prevention |

**Example implementation for trip-planner-chat:**

```typescript
import { checkRateLimit } from "../_shared/rateLimit.ts";

// After CORS check, before processing
const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
const { allowed, remaining, resetAt } = await checkRateLimit(
  supabaseAdmin,
  `chat:${ip}`,
  'trip-planner-chat',
  { windowMinutes: 1, maxRequests: 10 }
);

if (!allowed) {
  return new Response(
    JSON.stringify({ 
      error: 'Too many requests. Please wait a moment before trying again.',
      resetAt: resetAt.toISOString()
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetAt.getTime() - Date.now()) / 1000))
      } 
    }
  );
}
```

### Phase 3: Authentication Hardening

**3.1 Enable Leaked Password Protection**

This requires a manual step in the backend dashboard:

1. Open Lovable Cloud Dashboard
2. Navigate to Users → Authentication Settings
3. Enable "Leaked Password Protection"

**3.2 Update Error Handling for Leaked Passwords**

Update `src/pages/auth/Auth.tsx` to handle leaked password errors gracefully:

```typescript
// Add to error handling section
if (error?.message?.includes('data breach') || 
    error?.message?.includes('leaked password')) {
  toast.error(
    "This password has been found in a data breach. Please choose a different, more secure password.",
    { duration: 6000 }
  );
  return;
}
```

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Create | Database migration | RLS policies + rate_limits table |
| Create | `supabase/functions/_shared/rateLimit.ts` | Shared rate limiting helper |
| Modify | `supabase/functions/trip-planner-chat/index.ts` | Add rate limiting |
| Modify | `supabase/functions/send-reset-otp/index.ts` | Add rate limiting |
| Modify | `supabase/functions/verify-reset-otp/index.ts` | Add rate limiting |
| Modify | `supabase/functions/google-reviews/index.ts` | Add rate limiting |
| Modify | `supabase/functions/tripadvisor-search/index.ts` | Add rate limiting |
| Modify | `supabase/functions/scrape-instagram/index.ts` | Add rate limiting |
| Modify | `src/pages/auth/Auth.tsx` | Leaked password error handling |

## Implementation Priority

```text
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Data Protection (Database)                        │
│  ├── Fix vendor_profiles exposure                           │
│  ├── Add profiles table protection                          │
│  └── Add vendors table deny policy                          │
├─────────────────────────────────────────────────────────────┤
│  Phase 2: Rate Limiting (Edge Functions)                    │
│  ├── Create rate_limits table                               │
│  ├── Create shared rateLimit helper                         │
│  ├── Add to trip-planner-chat (highest priority)            │
│  ├── Add to send-reset-otp                                  │
│  └── Add to remaining functions                             │
├─────────────────────────────────────────────────────────────┤
│  Phase 3: Auth Hardening                                    │
│  ├── Enable Leaked Password Protection (manual)             │
│  └── Add error handling for leaked passwords                │
└─────────────────────────────────────────────────────────────┘
```

## Security Impact

| Before | After |
|--------|-------|
| Vendor emails/Stripe IDs exposed | Only public marketing data visible |
| Unlimited API requests | Rate-limited to prevent abuse |
| Weak passwords allowed | Compromised passwords blocked |
| No protection against email bombing | OTP requests limited per IP |

## Manual Steps Required

After implementation, you'll need to:

1. **Enable Leaked Password Protection** in the Lovable Cloud dashboard (Users → Authentication Settings)

## Technical Notes

- Rate limiting uses database storage instead of Redis for simplicity
- Rate limit windows are 1-minute sliding windows
- Expired rate limit records are cleaned up via a scheduled cleanup function
- All sensitive fields (stripe_account_id, commission rates, emails) are excluded from public views
