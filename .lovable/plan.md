

# Phase 1: Trust & Reviews Foundation (Features 4, 5, 10)

These three are tightly coupled -- trust score drives payout delay, and verified reviews feed trust score.

---

## Feature 4: Host Trust Score

**Database**: Add a `host_trust_score` integer column to `profiles` (default 0). Create a database function `calculate_host_trust_score(uuid)` that computes the score:

| Factor | Points |
|--------|--------|
| Verified identity (`host_verification_status = 'verified'`) | +25 |
| Verified payout (Stripe Connect complete) | +20 |
| Verified phone (non-null `verified_phone`) | +10 |
| Social profiles linked (future, placeholder) | +5 each, max 15 |
| Completed experiences (bookings with status `completed`) | +2 each, max 20 |
| Positive reviews (4-5 star avg on linked vendors) | +10 |

Total max: 100. Store as a materialized value updated via a trigger on relevant table changes (bookings, reviews, profiles).

**Frontend**: Display trust score badge on host dashboard and host profile. Show tier labels: "New Host" (0-30), "Trusted" (31-60), "Highly Trusted" (61-100).

**Permission gate**: Hosts with score < 30 limited to 2 active listings. Score 30-60 allows 5. Score 61+ is unlimited. Enforce in `vendor_profiles` INSERT policy or via edge function check.

---

## Feature 5: Verified Reviews

**Database**: Add RLS policy on `reviews` INSERT requiring a matching `completed` booking:
```sql
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = reviews.booking_id
    AND bookings.user_id = auth.uid()
    AND bookings.status = 'completed'
  )
)
```

Also add a UNIQUE constraint on `(booking_id)` to prevent duplicate reviews per booking.

**Frontend updates to VendorReviews**: Add rating distribution bar chart (5-star breakdown). Already shows avg rating and total count.

**ReviewDialog**: Already requires `bookingId` -- just enforce it as mandatory. Remove the `|| null` fallback.

**Host protection**: Existing RLS already prevents hosts from deleting others' reviews. No change needed since only the review author can UPDATE/DELETE.

---

## Feature 10: Host Payout Delay

**Database**: Add `first_booking_completed_at` timestamp column to `profiles`.

**Edge function change** (`release-payouts/index.ts`): After finding candidate bookings, check the host's trust score:
- If `host_trust_score < 30` (new host): require 7 days since booking completion instead of 24 hours
- If `host_trust_score >= 30`: use standard 24-hour delay

Update the cutoff logic to check per-booking based on the host's profile.

---

## Technical Details

**Migration SQL** will:
1. Add `host_trust_score` (integer, default 0) to `profiles`
2. Add `first_booking_completed_at` (timestamptz, nullable) to `profiles`  
3. Create `calculate_host_trust_score()` SQL function
4. Create trigger to recalculate score on profile/booking/review changes
5. Replace `reviews` INSERT policy to require completed booking match
6. Add unique constraint on `reviews(booking_id)`

**Files to modify**:
- `supabase/functions/release-payouts/index.ts` -- payout delay logic
- `src/components/VendorReviews.tsx` -- add rating distribution
- `src/components/ReviewDialog.tsx` -- enforce booking_id required
- `src/pages/host/Dashboard.tsx` -- show trust score badge
- `src/components/onboarding/HostVerificationCard.tsx` -- show trust score

**No new edge functions needed** for this phase.

---

## Phase 2 Preview (next batch)

Features 6 (Messaging + fraud detection), 7 (Fraud detection rules), 8 (Experience Guarantee/refunds)

## Phase 3 Preview (final batch)

Features 9 (Social identity verification), 11 (Admin dashboard consolidation with all new panels)

---

Shall I proceed with Phase 1 implementation?

