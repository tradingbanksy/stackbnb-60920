

# Plan: Simplify Signup & Onboarding Flow

## Overview

Implement a streamlined signup process that gets users to their dashboard quickly with just email and password, then uses progressive onboarding to collect additional details when needed.

## Current Problems

| Issue | Description |
|-------|-------------|
| Duplicate Signup Pages | 3 separate entry points: `/auth`, `/signup/host`, `/signup/vendor` |
| Too Many Steps | Host: 2 pages, 12+ fields. Vendor: 3-4 pages, 20+ fields |
| Confusing Role Selection | Role selection appears in multiple places |
| No Value First | Users fill forms before seeing their dashboard |

## New Simplified Flow

```text
ALL USERS (2-3 clicks to get started):
/auth → Select Role (Guest/Host/Vendor) → Email + Password → Dashboard

POST-SIGNUP PROGRESSIVE ONBOARDING:
├─ Guest: Optional profile completion via profile page
├─ Host: Dashboard shows "Complete your profile" card
└─ Vendor: Dashboard shows "Set up your listing" wizard
```

## Changes Required

### Phase 1: Consolidate Authentication

**Modify `src/pages/auth/Auth.tsx`**
- Keep existing role selection cards (Guest/Host/Vendor)
- After role selection, show only Email + Password fields
- On successful signup, assign role and redirect to dashboard
- Match the glass-morphic theme from `/select-role`

### Phase 2: Host Onboarding Card

**Create `src/components/onboarding/HostOnboardingCard.tsx`**
- Shows on Host Dashboard if profile incomplete
- Collects: Property Name, Airbnb URL, Address
- Collapsible/dismissable, saves progress automatically

### Phase 3: Vendor Onboarding Wizard

**Create `src/components/onboarding/VendorOnboardingWizard.tsx`**
- Stepped modal/drawer for guided setup
- Step 1: Basic Info (Name, Category, Type)
- Step 2: Photos (Upload or Instagram import)
- Step 3: Pricing & Details
- Step 4: Description (with AI option)
- Progress bar, can save and resume

### Phase 4: Update Dashboards

**Modify `src/pages/host/Dashboard.tsx`**
- Show HostOnboardingCard if property info missing
- Card disappears once complete

**Modify `src/pages/vendor/Dashboard.tsx`**
- Show VendorOnboardingWizard on first visit if no vendor_profile
- Wizard can be minimized and resumed

### Phase 5: Cleanup

**Remove deprecated files:**
- `src/pages/host/Signup.tsx`
- `src/pages/host/PropertyInfo.tsx`
- `src/pages/vendor/Signup.tsx`
- `src/pages/vendor/BusinessDetails.tsx`
- `src/pages/auth/RoleSelection.tsx`

**Update routes in `src/App.tsx`**
- Remove old signup routes
- Update redirects

**Simplify `src/contexts/SignupContext.tsx`**
- Remove multi-page form state (no longer needed)

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/onboarding/HostOnboardingCard.tsx` | In-dashboard host setup form |
| Create | `src/components/onboarding/VendorOnboardingWizard.tsx` | Stepped vendor profile wizard |
| Modify | `src/pages/auth/Auth.tsx` | Simplify to email/password only |
| Modify | `src/pages/host/Dashboard.tsx` | Add onboarding card |
| Modify | `src/pages/vendor/Dashboard.tsx` | Add onboarding wizard trigger |
| Modify | `src/App.tsx` | Remove old signup routes |
| Delete | `src/pages/host/Signup.tsx` | No longer needed |
| Delete | `src/pages/host/PropertyInfo.tsx` | Moved to onboarding card |
| Delete | `src/pages/vendor/Signup.tsx` | No longer needed |
| Delete | `src/pages/vendor/BusinessDetails.tsx` | Moved to wizard |
| Delete | `src/pages/auth/RoleSelection.tsx` | Merged into Auth.tsx |
| Modify | `src/contexts/SignupContext.tsx` | Simplify or remove |

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| Time to dashboard | 3-5 minutes | 30 seconds |
| Fields before access | 12-20 | 2 |
| Signup entry points | 3 | 1 |
| Mobile experience | Long forms | Progressive |

