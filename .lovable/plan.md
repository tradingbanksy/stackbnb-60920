
# Plan: Complete Payment & Payout System

## Overview

Implement a complete payment flow where guests can purchase bookings through the website, with funds automatically split between the platform owner (you), hosts, and vendors based on the existing commission logic. This plan also makes the "Payment Settings" page functional so users can add/manage their debit cards for withdrawals.

## Current System Analysis

### Existing Payment Flow (Already Working)
The system already has most of the infrastructure built:

1. **Stripe Connect Express** is set up for both hosts and vendors
2. **Checkout Flow** (`create-booking-checkout`) correctly calculates splits:
   - If guest books via host's link: Host gets commission, Platform gets 3%, Vendor gets remainder
   - If guest books directly (no referral): Platform gets (3% + host commission %), Vendor gets remainder
3. **Webhook** (`stripe-webhook`) records bookings with payout amounts
4. **Host/Vendor Dashboards** have "Connect Stripe" buttons that work

### What's Missing

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Stripe Connect Onboarding | Working | None |
| Payment Settings Page | Placeholder only | Make functional |
| View Connected Account Info | Not implemented | Add to Payment Settings |
| Access Stripe Dashboard (for withdrawals) | Not implemented | Add dashboard link |
| Payout History | Placeholder only | Show real booking payouts |
| Platform Owner Payouts | Partially working | Clarify flow |

## Commission Logic Summary (Already Implemented)

```text
┌──────────────────────────────────────────────────────────────────┐
│                     BOOKING WITH HOST REFERRAL                   │
├──────────────────────────────────────────────────────────────────┤
│  Guest pays $100 for experience                                  │
│                                                                  │
│  Platform Fee (3%)     →  $3.00   (stays with you)              │
│  Host Commission (10%) →  $10.00  (transferred to host)         │
│  Vendor Payout         →  $87.00  (transferred to vendor)       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   BOOKING WITHOUT HOST (DIRECT)                  │
├──────────────────────────────────────────────────────────────────┤
│  Guest pays $100 for experience                                  │
│                                                                  │
│  Platform Fee (3% + 10%) →  $13.00  (stays with you)            │
│  Host Commission         →  $0.00   (no host)                    │
│  Vendor Payout           →  $87.00  (transferred to vendor)      │
└──────────────────────────────────────────────────────────────────┘
```

The platform owner (you) receives the "application fee" which is:
- Platform fee % (from `platform_settings` table, default 3%)
- Plus host commission % when there's no host referral

## Changes Required

### Phase 1: Functional Payment Settings Page

Replace the placeholder "Coming Soon" card with a functional page showing:
- Stripe Connect status (connected/not connected)
- Button to set up or update payment method
- Link to Stripe Express Dashboard (for managing payouts)
- Account details (last 4 of bank, payout schedule)

**File:** `src/pages/host/PaymentSettings.tsx`

```tsx
// Key features:
// 1. Check Stripe Connect status using existing check-connect-status function
// 2. Show "Set Up Payouts" or "Manage Account" based on status
// 3. Link to Stripe Express Dashboard for withdrawal management
```

### Phase 2: Create Stripe Dashboard Link Function

Create a new Edge Function that generates a link to the Stripe Express Dashboard where users can:
- View their balance
- Manage payout schedule
- Add/update bank accounts (debit cards)
- View payout history

**New File:** `supabase/functions/create-stripe-login-link/index.ts`

```typescript
// Uses stripe.accounts.createLoginLink() to generate
// a one-time link to the Stripe Express Dashboard
// where users manage their bank/card for withdrawals
```

### Phase 3: Functional Payout History Page

Replace placeholder with real data from the `bookings` table, showing:
- Booking date
- Experience name
- Commission earned
- Payout status

**File:** `src/pages/host/PayoutHistory.tsx`

Query the bookings table for entries where `host_user_id` = current user and display `host_payout_amount`.

### Phase 4: Vendor Payment Settings & Payout Pages

Apply the same changes to vendor pages:
- `src/pages/vendor/Settings.tsx` (or create PaymentSettings equivalent)

## Detailed Implementation

### 1. Create Stripe Login Link Edge Function

**New File:** `supabase/functions/create-stripe-login-link/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// CORS and auth handling...

serve(async (req) => {
  // Authenticate user
  // Get accountType from body (host or vendor)
  // Fetch stripe_account_id from profiles or vendor_profiles
  // Create login link: stripe.accounts.createLoginLink(stripeAccountId)
  // Return the URL
});
```

### 2. Update Host Payment Settings Page

**File:** `src/pages/host/PaymentSettings.tsx`

```text
┌─────────────────────────────────────────────────────────────────┐
│  Payment Settings                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ✓ Stripe Connected                                       │ │
│  │  Payouts are enabled to your bank account                 │ │
│  │                                                           │ │
│  │  [Manage Payout Settings →]                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Or if not connected:                                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ⚠ Set Up Payouts                                         │ │
│  │  Connect your bank account to receive commissions         │ │
│  │                                                           │ │
│  │  [Connect Bank Account]                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Key features:
- Check connect status on load
- "Connect Bank Account" → calls `create-connect-account`
- "Manage Payout Settings" → calls `create-stripe-login-link` and redirects

### 3. Update Payout History Page

**File:** `src/pages/host/PayoutHistory.tsx`

```tsx
// Fetch from bookings table:
const { data: payouts } = await supabase
  .from('bookings')
  .select('*')
  .eq('host_user_id', user.id)
  .order('created_at', { ascending: false });

// Display each booking with:
// - Date
// - Experience name
// - Total booking amount
// - Your commission (host_payout_amount)
// - Status (payout_status)
```

### 4. Vendor Payment Settings

Create or update vendor payment settings to match the host flow.

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `supabase/functions/create-stripe-login-link/index.ts` | Generate Stripe Dashboard link |
| Modify | `src/pages/host/PaymentSettings.tsx` | Functional payment settings |
| Modify | `src/pages/host/PayoutHistory.tsx` | Real payout history from DB |
| Modify | `src/pages/vendor/Settings.tsx` | Add payment settings section |

## How Withdrawals Work (User Flow)

1. **Host/Vendor sets up Stripe Connect** (already working)
   - Clicks "Connect" on Dashboard
   - Completes Stripe Express onboarding
   - Adds their bank account/debit card in Stripe's interface

2. **Guest makes a booking** (already working)
   - Pays via Stripe Checkout
   - Funds are automatically split per the commission logic
   - Vendor receives their portion directly
   - Host receives their commission via transfer
   - Platform keeps the application fee

3. **Host/Vendor views earnings** (to be implemented)
   - Goes to Payment Settings
   - Clicks "Manage Payout Settings"
   - Opens Stripe Express Dashboard
   - Views balance, payout schedule, bank details

4. **Payouts happen automatically**
   - Stripe handles payouts on a schedule (daily/weekly)
   - Users can configure this in their Stripe Dashboard
   - No action needed from platform

## Platform Owner (You) Receiving Funds

As the platform owner, your earnings (the application_fee) are automatically kept in your main Stripe account. You don't need to set up anything special - the funds from each transaction that don't get transferred to vendors/hosts stay with you.

To view your platform earnings:
1. Log into your Stripe Dashboard (stripe.com)
2. View the "Application fees" section
3. Set up your own payout schedule to your bank

## Technical Notes

- Stripe Express handles all bank/debit card management
- We don't store any card numbers - Stripe handles everything
- The `stripe.accounts.createLoginLink()` creates a secure one-time link
- Payouts happen automatically based on Stripe's schedule
- The existing webhook already handles host transfers correctly
