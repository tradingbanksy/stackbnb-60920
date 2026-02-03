
# Plan: Auth Review & Admin Access Improvements

## Overview

Review and improve the authentication flow, ensure the admin role works smoothly for `gmunoz512@icloud.com`, and add a back button to the splash page.

## Current State Assessment

### Password Reset Flow (Working Well)
The forgot password feature uses a secure OTP-based flow:
1. User enters email and clicks "Forgot password?"
2. `send-reset-otp` edge function sends a 6-digit code to email
3. User enters OTP in a dialog
4. `verify-reset-otp` validates the code and generates a secure reset link
5. User is redirected to `/reset-password` to set a new password

Security features in place:
- Rate limiting: 3 OTP sends per minute, 5 verification attempts per minute
- OTPs expire after 10 minutes
- Codes are deleted after use

### Login Process (Working Well)
- Email/password authentication via Supabase
- Google OAuth integration
- Leaked password detection with user-friendly error messages
- Role-based redirects after sign-in
- Users without a role are prompted to select one

### Admin Access (Already Configured)
Good news: `gmunoz512@icloud.com` is **already an admin** in the system.

Current admin capabilities:
- `/admin/settings` - Configure platform fee percentage
- `/admin/promo-codes` - Create and manage discount codes

## Changes Required

### 1. Add Back Button to Splash Page on Auth

The `/auth` page currently has "Back to role selection" when signing up with a role, but there's no way to return to the splash page (`/`) for users who don't want to sign up yet.

**File:** `src/pages/auth/Auth.tsx`

Add a back link at the bottom of both the role selection view and the sign-in form:

```text
Role Selection View:
┌─────────────────────────────────────┐
│           [stackd logo]            │
│                                     │
│        Choose your role.           │
│                                     │
│  [Guest Card]                       │
│  [Host Card]                        │
│  [Vendor Card]                      │
│                                     │
│  Already have an account? Sign in  │
│                                     │
│       ← Back to home               │  ← NEW
└─────────────────────────────────────┘

Sign-In View:
┌─────────────────────────────────────┐
│           [stackd logo]            │
│                                     │
│     ┌───────────────────────┐      │
│     │ Email / Password Form │      │
│     └───────────────────────┘      │
│                                     │
│  Don't have an account? Sign up    │
│                                     │
│       ← Back to home               │  ← NEW
└─────────────────────────────────────┘
```

### 2. What Admin Should Have Access To (Legal Considerations)

| Access Type | Should Have? | Reasoning |
|-------------|--------------|-----------|
| **Platform Settings** | Yes ✓ | Already implemented. Controls platform fee % |
| **Promo Codes** | Yes ✓ | Already implemented. Business operations |
| **Aggregate Analytics** | Yes | Total bookings, revenue trends, user counts. Non-PII |
| **User Listing** | Carefully | View email, role, status. No passwords or payment details |
| **Vendor/Host Listings** | Yes | Approval workflows, quality control |
| **Booking Records** | Carefully | For dispute resolution. Hide full payment details |
| **Direct Stripe Data** | No | PCI compliance - access through Stripe dashboard |
| **Private Messages** | No | Privacy violation unless support ticket |
| **Raw User Passwords** | Never | Technically impossible with proper hashing |

The current admin setup is appropriate for a platform owner - it provides control over business settings without exposing sensitive user data.

### 3. Ensure Smooth Re-login Flow

The current flow works correctly:
1. Sign in → fetch role → redirect to appropriate dashboard
2. If no role found → prompt role selection
3. Session persists across browser refreshes

No changes needed, but worth noting the flow:

```text
Sign In Flow:
┌─────────────────┐
│  Enter Email    │
│  Enter Password │
│  [Sign In]      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Auth   │
│ Validates       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch user_roles│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Has Role   No Role
    │         │
    │         ▼
    │  ┌─────────────┐
    │  │ Show Role   │
    │  │ Selection   │
    │  └─────────────┘
    │
    ▼
┌─────────────────┐
│ Redirect to     │
│ role-specific   │
│ dashboard       │
└─────────────────┘
```

## Implementation Details

### File Changes

| Action | File | Changes |
|--------|------|---------|
| Modify | `src/pages/auth/Auth.tsx` | Add "Back to home" link in both role selection and sign-in views |
| Modify | `src/pages/marketing/SplashPage.tsx` | Fix Sign Up link to go to `/auth` instead of `/select-role` (which no longer exists) |

### Code Changes

**1. Auth.tsx - Add back link to role selection view (around line 227)**

After the "Already have an account?" link, add:
```tsx
{/* Back to splash page */}
<div className="text-center">
  <Link
    to="/"
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    ← Back to home
  </Link>
</div>
```

**2. Auth.tsx - Add back link to sign-in form (around line 625)**

Add a back link that shows when NOT in signup mode or after the role selection back link:
```tsx
{/* Back to home - always available */}
<div className="text-center">
  <Link
    to="/"
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    ← Back to home
  </Link>
</div>
```

**3. SplashPage.tsx - Fix Sign Up link (line 62-78)**

The "Sign Up" button currently goes to `/select-role` which redirects to `/auth`. Update to go directly to `/auth`:
```tsx
<Link
  to="/auth"  // Changed from "/select-role"
  onClick={handleSignupClick}
  // ... rest of styling
>
  Sign Up
</Link>
```

## Summary

1. **Password reset works well** - OTP-based, rate-limited, secure
2. **Login flow works well** - Role-based routing, session persistence
3. **Admin access is already set up** for `gmunoz512@icloud.com`
4. **Add back button** to `/auth` page to return to splash page
5. **Fix splash page** Sign Up link to go directly to `/auth`

The admin currently has appropriate access to business settings without exposing sensitive user data. The existing permissions (platform settings, promo codes) are suitable for a platform owner role.
