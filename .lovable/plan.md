

# Fix: Restore Experiences Visibility

## What Happened

The security migration we just applied accidentally broke the guest-facing experience and vendor displays. Here's why:

- We created public views with `security_invoker=on`, which forces the database to check the **calling user's** permissions on the base table
- We also restricted the base table to only allow owners and linked hosts to read it
- Result: when a guest queries the public view, they have no permission on the base table, so the view returns **zero rows**

## The Fix

Recreate both views **without** `security_invoker=on`. This way:
- The view runs with the privileges of the view creator (which can read the base table)
- Guests can read the safe, filtered columns through the view
- The base table remains locked down -- direct queries to `vendor_profiles` or `itineraries` are still blocked by RLS
- Sensitive fields (`user_id`, `stripe_account_id`, commissions) are never exposed because the view simply doesn't include them

This is the standard Postgres pattern for security views -- the view acts as a controlled "window" into the data.

## Database Migration

A single migration that drops and recreates both views without `security_invoker`:

```text
1. DROP VIEW vendor_profiles_public
2. CREATE VIEW vendor_profiles_public (same columns, no security_invoker)
3. DROP VIEW itineraries_public
4. CREATE VIEW itineraries_public (same columns, no security_invoker)
```

## Code Changes

No frontend code changes are needed -- the queries already target the public views. Once the views return data again, the experiences will reappear.

## Technical Details

### SQL Migration

```sql
-- Fix vendor_profiles_public: remove security_invoker so guests can read
DROP VIEW IF EXISTS public.vendor_profiles_public;
CREATE VIEW public.vendor_profiles_public AS
SELECT
  id, name, category, description, about_experience,
  photos, menu_url, instagram_url, price_per_person,
  price_tiers, duration, max_guests, google_rating,
  google_place_id, google_reviews_url, airbnb_experience_url,
  airbnb_reviews, included_items, age_restriction,
  listing_type, is_published, cancellation_hours, created_at, city
FROM public.vendor_profiles
WHERE is_published = true;

-- Fix itineraries_public: remove security_invoker so anon can read shared trips
DROP VIEW IF EXISTS public.itineraries_public;
CREATE VIEW public.itineraries_public AS
SELECT
  id, destination, start_date, end_date,
  itinerary_data #- '{userId}' as itinerary_data,
  is_confirmed, share_token, is_public,
  created_at, updated_at
FROM public.itineraries
WHERE is_public = true;
```

### Why This Is Still Secure

| Access Path | What Happens |
|-------------|--------------|
| Guest queries `vendor_profiles_public` | View returns only safe columns for published vendors -- no `user_id`, no Stripe ID, no commissions |
| Guest queries `vendor_profiles` directly | RLS blocks them -- only owners and linked hosts can SELECT |
| Guest queries `itineraries_public` | View returns itinerary data with `userId` stripped from JSON |
| Guest queries `itineraries` directly | RLS blocks them -- only owners and collaborators can SELECT |

### Files Affected

| File | Change |
|------|--------|
| New SQL migration | Recreate both views without `security_invoker=on` |

No frontend files need changes.

