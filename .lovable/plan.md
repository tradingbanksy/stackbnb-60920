

# Plan: Bulletproof Business Verification System

## Overview

Implement a multi-layered verification system to prevent fraudulent vendors from listing experiences and charging customers. This will add mandatory admin approval before vendors can go live, combined with Stripe's built-in identity verification.

## Current State Analysis

**What exists today:**
- Vendors self-register and can immediately toggle `is_published` to go live
- Stripe Connect Express onboarding provides KYC (Know Your Customer) verification
- No admin approval gate before publishing
- No business document verification
- Admin panel exists but only manages platform fees and promo codes

**Gap identified:**
Anyone can create an experience listing and, once Stripe onboarding is complete, start accepting payments without any human review.

## Proposed Verification Layers

```text
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Stripe Connect (Automatic)                            │
│  ├── Identity verification (ID + selfie)                        │
│  ├── Bank account verification                                  │
│  └── Tax information collection                                 │
│                                                                  │
│  Layer 2: Profile Completion Gate (Automatic)                   │
│  ├── Require minimum photos (3+)                                │
│  ├── Require description/about text                             │
│  ├── Require pricing information                                │
│  └── Require category selection                                 │
│                                                                  │
│  Layer 3: Admin Review (Manual)                                 │
│  ├── Review submitted profiles in approval queue                │
│  ├── Approve, reject, or request changes                        │
│  ├── Add verification notes                                     │
│  └── Email notifications on status change                       │
│                                                                  │
│  Layer 4: Business Documentation (Optional/Future)              │
│  ├── Business license upload                                    │
│  ├── Insurance certificate                                      │
│  └── Professional certifications                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Changes

### New Columns on `vendor_profiles` Table

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `verification_status` | enum | `'pending'` | Track approval state |
| `verification_notes` | text | null | Admin notes/feedback |
| `verified_at` | timestamp | null | When admin approved |
| `verified_by` | uuid | null | Admin who approved |
| `submitted_for_review_at` | timestamp | null | When vendor requested review |

### New Enum: `verification_status`

```sql
CREATE TYPE public.vendor_verification_status AS ENUM (
  'draft',           -- Not yet submitted for review
  'pending',         -- Submitted, awaiting admin review
  'approved',        -- Admin approved, can publish
  'rejected',        -- Admin rejected with feedback
  'changes_requested' -- Admin wants modifications
);
```

## Workflow Changes

### Vendor Journey (New)

```text
1. Create Profile (Draft)
   ├── Fill out basic info, photos, pricing
   └── Profile saved as verification_status = 'draft'

2. Submit for Review
   ├── Vendor clicks "Submit for Approval"
   ├── System validates completeness requirements
   ├── Status changes to 'pending'
   └── Admin receives email notification

3. Admin Reviews
   ├── Admin sees profile in approval queue
   ├── Reviews photos, description, pricing
   ├── Decision: Approve / Reject / Request Changes
   └── Vendor receives email with decision

4. If Approved
   ├── verification_status = 'approved'
   ├── Vendor can now toggle is_published
   └── Profile appears in public listings

5. If Rejected or Changes Requested
   ├── Vendor sees feedback in dashboard
   ├── Makes corrections
   └── Re-submits for review
```

### Publishing Gate Logic

```typescript
// Before: Anyone can publish
const handlePublish = async () => {
  await supabase.update({ is_published: true });
};

// After: Only approved vendors can publish
const handlePublish = async () => {
  if (profile.verification_status !== 'approved') {
    toast.error('Your profile must be approved before publishing');
    return;
  }
  if (!profile.stripe_onboarding_complete) {
    toast.error('Complete payment setup first');
    return;
  }
  await supabase.update({ is_published: true });
};
```

## Implementation Components

### 1. Database Migration

```sql
-- Create verification status enum
CREATE TYPE public.vendor_verification_status AS ENUM (
  'draft', 'pending', 'approved', 'rejected', 'changes_requested'
);

-- Add verification columns
ALTER TABLE public.vendor_profiles
  ADD COLUMN verification_status vendor_verification_status DEFAULT 'draft',
  ADD COLUMN verification_notes text,
  ADD COLUMN verified_at timestamptz,
  ADD COLUMN verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN submitted_for_review_at timestamptz;

-- Update RLS to prevent publishing unless approved
CREATE POLICY "Vendors can only publish if approved"
  ON public.vendor_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    CASE 
      WHEN is_published = true THEN verification_status = 'approved'
      ELSE true
    END
  );
```

### 2. Admin Approval Queue (New Page)

Create `/admin/vendor-approvals` with:
- List of pending vendor submissions
- Profile preview modal
- Approve/Reject/Request Changes actions
- Notes field for feedback
- Filter by status

### 3. Vendor Dashboard Updates

**ProfilePreview.tsx changes:**
- Show verification status badge prominently
- Replace "Publish" button with "Submit for Review" if not approved
- Display admin feedback when status is rejected/changes_requested
- Only enable publishing toggle when `verification_status === 'approved'`

### 4. Email Notifications

**New notification types in `send-admin-notification`:**
- `vendor_submitted_for_review` - Alert admin of new submission
- `vendor_approved` - Notify vendor of approval
- `vendor_rejected` - Notify vendor with rejection reason
- `vendor_changes_requested` - Notify vendor of needed changes

### 5. Completeness Validation

Before allowing "Submit for Review":
- At least 3 photos uploaded
- Description filled (min 50 characters)
- Pricing set (either per-person or tiers)
- Category selected
- Duration specified

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/xxx_vendor_verification.sql` | Create | Add verification columns |
| `src/pages/admin/VendorApprovals.tsx` | Create | Admin approval queue UI |
| `src/pages/admin/index.ts` | Modify | Export new page |
| `src/App.tsx` | Modify | Add route for approval queue |
| `src/pages/vendor/ProfilePreview.tsx` | Modify | Add verification status UI |
| `src/pages/admin/PlatformSettings.tsx` | Modify | Add link to approvals |
| `supabase/functions/send-admin-notification/index.ts` | Modify | Add new notification types |

## Security Considerations

1. **RLS Policy Enforcement**: Database-level check prevents setting `is_published = true` unless `verification_status = 'approved'`

2. **Admin-Only Actions**: Only users with `admin` role in `user_roles` can approve/reject

3. **Audit Trail**: `verified_by` and `verified_at` track who approved and when

4. **Stripe as Baseline**: Stripe's KYC verification provides identity confirmation that Stackd leverages

## Optional Future Enhancements

For even stronger verification (can be added later):
- **Business Document Uploads**: Storage bucket for licenses/insurance
- **Phone Verification**: SMS verification during signup
- **Video Verification**: Live video call with admin
- **Social Proof Requirements**: Minimum reviews before going live
- **Tiered Verification Badges**: Bronze/Silver/Gold verification levels

## Rollout Strategy

1. Deploy database migration (existing vendors get `verification_status = 'approved'` to grandfather them)
2. Deploy admin approval queue
3. Update vendor UI to show verification flow
4. Enable email notifications
5. Announce to new vendors that review is required

