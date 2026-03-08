

# Review: Vendor Trust & Safety — Gap Analysis

Your spec is vendor-centric (experience marketplace). The current implementation was built around a host/vendor split model. Here's what's covered, what's missing, and what needs adjustment.

---

## What's Already Built (working well)

| Spec Item | Status | Notes |
|-----------|--------|-------|
| **Identity Verification** (Gov ID, selfie, phone, email, payout) | Mostly done | Exists for hosts via `verify-host` edge function + `host-verification-docs` bucket. Stripe Connect KYC covers payout/identity. Need to extend to vendor role. |
| **Experience Listings** | Done | `vendor_profiles` table covers this with name, description, category, price, max_guests, status, etc. |
| **Listing Approval Queue** | Done | `VendorApprovals.tsx` with full admin review flow (approve/reject/request changes). `verification_status` enum on `vendor_profiles`. |
| **Booking System** | Done | `bookings` table with all required statuses. RLS prevents client-side tampering. |
| **Escrow Payments** | Done | Stripe Connect, platform holds funds, `release-payouts` runs hourly. |
| **7-day payout delay for new vendors** | Done | `release-payouts` checks `host_trust_score` — new vendors (score < 30) wait 7 days. |
| **Review System** (booking-gated) | Done | `reviews` table with RLS requiring completed booking. Rating distribution display in `VendorReviews.tsx`. |
| **Messaging with fraud detection** | Done | `conversations`/`messages` tables with trigger flagging phone numbers, WhatsApp, Venmo, etc. |
| **Fraud Detection** | Partial | Triggers for multiple listings and suspicious pricing exist. Missing: duplicate content, stock images, booking spikes. |
| **Experience Guarantee / Refund** | Done | `refund_requests` table, `process-refund` edge function, admin panel. |
| **Admin Dashboard** | Done | Vendor approvals, fraud alerts, message moderation, refund requests, host verification, platform settings all exist. |

---

## Gaps & Improvements Needed

### 1. Vendor Identity Verification (currently host-only)
The `verify-host` edge function and `host-verification-docs` bucket only work for host profiles. Vendors need the same flow.
- **Fix**: Extend `verify-host` (or create `verify-vendor`) to support vendor profiles. Add `verification_status`, `government_id_url`, `selfie_url`, `verified_phone` columns to `vendor_profiles` (or reuse from the user's `profiles` row since every vendor is also a user).
- **Impact**: Medium. Mostly edge function + onboarding UI changes.

### 2. Experience Ownership Verification (Missing)
The spec requires vendors to prove they operate the experience (website, LinkedIn, social media, photos of events, business registration). Currently, the admin approval only checks listing quality (photos, description, pricing), not ownership proof.
- **Fix**: Add fields to `vendor_profiles`: `website_url`, `linkedin_url`, `business_registration_url`, `ownership_evidence_urls` (text[]). Add these as an upload step in vendor onboarding. Show them in the admin approval panel.
- **Impact**: Medium. Schema change + onboarding wizard update + admin UI update.

### 3. Trust Score is Host-Only
`calculate_host_trust_score()` and `TrustScoreBadge` are built for hosts. Since this is a vendor marketplace, the trust score should apply to vendors.
- **Fix**: Create `calculate_vendor_trust_score()` using vendor-specific signals: identity verified, payout verified, social profiles connected, completed experiences count, average rating, low refund rate. Add `trust_score` column to `vendor_profiles`. Display on vendor dashboard and public profile.
- **Impact**: Medium. New SQL function + trigger + UI components.

### 4. Refund/Dispute Rate in Trust Score (Missing)
The spec says trust score should factor in "low refund/dispute rate." Current `calculate_host_trust_score()` doesn't check refund history.
- **Fix**: Add a penalty factor — if refund rate > 10%, deduct points. Query `refund_requests` with status = 'approved' vs total completed bookings.

### 5. Admin: Suspend Vendor & Ban Account (Missing)
Admin can approve/reject listings but cannot suspend a vendor or ban an account entirely.
- **Fix**: Add `suspended` to the `vendor_verification_status` enum (already exists). Add a "Suspend" action in admin panel that sets `verification_status = 'suspended'` and unpublishes all listings. For account bans, add `is_banned` to `profiles` and check it in auth flow.

### 6. Admin: Remove Individual Experiences (Missing)
Admin can change verification status but there's no explicit "remove experience" action in the fraud/approval queue.
- **Fix**: Add a "Remove Listing" button in admin panels that deletes or suspends the vendor profile.

### 7. Fraud Detection Gaps
Current triggers only check multiple listings and low pricing. Missing from spec:
- **Duplicate experiences** (same description/title by different vendors)
- **Stock image detection** (requires external API — out of scope for triggers, note as future)
- **Booking spikes for new vendors** (partially mentioned but trigger not yet on bookings table)
- **Fix**: Add a booking insert trigger checking if vendor has < 7 days on platform + > 5 bookings. Add a trigger comparing new listing titles against existing ones for duplicates.

### 8. Vendor Trust Score Monitoring in Admin (Missing)
The spec asks for "vendor trust score monitoring" in the admin panel. Currently no admin view for this.
- **Fix**: Add a section in admin showing vendors sorted by trust score, with ability to drill into score breakdown.

---

## Recommended Implementation Order

**Batch A** (highest priority — fills critical gaps):
1. Vendor identity verification (extend host flow to vendors)
2. Experience ownership fields (website, LinkedIn, evidence uploads)
3. Vendor trust score (new SQL function + display)

**Batch B** (admin power + fraud):
4. Admin suspend/ban actions
5. Additional fraud triggers (duplicate listings, booking spikes)
6. Trust score monitoring admin panel

---

Shall I proceed with Batch A implementation?

