
# Security Remediation Plan

## Overview

This plan addresses the 4 security issues identified by the security scanner:

| Issue | Severity | Description |
|-------|----------|-------------|
| Itinerary User Data Exposure | ERROR | Public itineraries expose `user_id` at the database level |
| Vendor Profiles Contact Exposure | ERROR | `user_id`, `stripe_account_id`, and commission rates exposed |
| Vendor Profiles Public View Gap | WARN | Main table still readable despite public view existing |
| Leaked Password Protection | WARN | Password breach checking disabled in auth settings |

---

## Issue 1: Itinerary User Data Exposure (ERROR)

### Problem
The `itineraries` table allows public SELECT when `is_public = true`, exposing:
- `user_id` (owner's UUID)
- Full `itinerary_data` (which also contains `userId` in the JSON)

The frontend sanitizes the data, but the database itself returns sensitive fields.

### Solution
Create a **database view** for public itinerary access that excludes sensitive columns, then update RLS policies to use the view for anonymous/public access.

### Database Changes

```text
1. Create a public-safe view:
   CREATE VIEW itineraries_public WITH (security_invoker=on) AS
   SELECT
     id,
     destination,
     start_date,
     end_date,
     itinerary_data - 'userId' as itinerary_data,  -- Strip userId from JSON
     is_confirmed,
     share_token,
     is_public,
     created_at,
     updated_at
   FROM itineraries
   WHERE is_public = true;

2. Update RLS on base table to deny anon SELECT:
   - Drop "Anyone can view public itineraries" policy
   - Drop "Deny anon access to private itineraries" policy
   - Keep owner and collaborator policies intact
```

### Code Changes

| File | Change |
|------|--------|
| `src/features/trip-planner/hooks/useItinerarySync.ts` | Query `itineraries_public` view for share_token lookups when user is not authenticated |

---

## Issue 2: Vendor Profiles Contact Exposure (ERROR)

### Problem
Authenticated users can query `vendor_profiles` directly and see:
- `user_id` (links vendor to auth identity)
- `stripe_account_id` (payment account)
- `commission_percentage` and `host_commission_percentage`

### Solution
Restrict the base `vendor_profiles` table to owners/admins only, and have guests query the existing `vendor_profiles_public` view.

### Database Changes

```text
1. Drop the current public SELECT policy:
   DROP POLICY "Users can view all published vendor profiles" 
     ON vendor_profiles;

2. Create strict owner-only policy:
   CREATE POLICY "Users can only view their own vendor profile"
     ON vendor_profiles FOR SELECT
     USING (auth.uid() = user_id);

3. Update the public view to add security_invoker:
   DROP VIEW vendor_profiles_public;
   CREATE VIEW vendor_profiles_public WITH (security_invoker=on) AS
   SELECT ... (same columns as before, no sensitive data)
   FROM vendor_profiles WHERE is_published = true;
```

### Code Changes

| File | Change |
|------|--------|
| `src/pages/guest/Storefront.tsx` | Query `vendor_profiles_public` instead of `vendor_profiles` |
| `src/pages/vendor/PublicProfile.tsx` | Use `vendor_profiles_public` for public-facing reads |
| Any other guest-facing queries | Update to use the public view |

---

## Issue 3: Vendor Profiles Public View Gap (WARN)

### Problem
The `vendor_profiles_public` view exists but guests still hit the base table, which exposes all columns.

### Solution
This is addressed by Issue 2 above - once base table access is restricted, guests must use the view.

---

## Issue 4: Leaked Password Protection (WARN)

### Problem
Users can set passwords that have appeared in data breaches (e.g., "password123").

### Solution
This is a **backend configuration change** that cannot be done via code. 

### Steps for the Developer

```text
1. Open Cloud View
2. Navigate to Authentication > Providers > Email
3. Enable "Leaked Password Protection"
4. Save
```

The application code already handles the error message (lines 381-389 in Auth.tsx).

---

## Implementation Order

```text
Step 1: Database Migrations
├── Create itineraries_public view
├── Update itineraries RLS policies
├── Update vendor_profiles RLS policies
└── Recreate vendor_profiles_public view with security_invoker

Step 2: Code Updates
├── Update SharedItinerary.tsx to use itineraries_public view for anon users
├── Update useItinerarySync.ts for view-based queries
├── Update Storefront.tsx to use vendor_profiles_public
└── Audit other guest-facing queries

Step 3: Manual Configuration
└── Enable Leaked Password Protection in backend settings

Step 4: Verification
└── Run security scan to confirm all issues resolved
```

---

## Technical Details

### New Database Objects

**itineraries_public view:**
```sql
CREATE VIEW public.itineraries_public
WITH (security_invoker=on) AS
SELECT
  id,
  destination,
  start_date,
  end_date,
  itinerary_data #- '{userId}' as itinerary_data,
  is_confirmed,
  share_token,
  is_public,
  created_at,
  updated_at
FROM public.itineraries
WHERE is_public = true;
```

**Updated vendor_profiles_public view:**
```sql
CREATE VIEW public.vendor_profiles_public
WITH (security_invoker=on) AS
SELECT
  id, name, category, description, about_experience,
  photos, menu_url, instagram_url, price_per_person,
  price_tiers, duration, max_guests, google_rating,
  google_place_id, google_reviews_url, airbnb_experience_url,
  airbnb_reviews, included_items, age_restriction,
  listing_type, is_published, cancellation_hours, created_at, city
FROM public.vendor_profiles
WHERE is_published = true;
```

---

## Files to Modify

| File | Type | Purpose |
|------|------|---------|
| New migration | SQL | Create views and update RLS policies |
| `src/features/trip-planner/hooks/useItinerarySync.ts` | TSX | Use public view for anonymous queries |
| `src/pages/guest/SharedItinerary.tsx` | TSX | Ensure anon path uses public view |
| `src/pages/guest/Storefront.tsx` | TSX | Query vendor_profiles_public |
| `src/pages/vendor/PublicProfile.tsx` | TSX | Query vendor_profiles_public |

---

## Expected Outcome

After implementation:
- Anonymous users cannot see `user_id` in itineraries (at database level)
- Guests cannot see vendor `user_id`, `stripe_account_id`, or commission rates
- Owners and admins retain full access to their own data
- Password breach protection blocks compromised passwords
