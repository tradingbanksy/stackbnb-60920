

## Fix Google Sign-In Redirect on Mobile

### Problem
When tapping "Continue with Google" on mobile, the OAuth flow redirects back to `/` (the splash page) after authentication. The splash page has no logic to detect the newly authenticated session and route the user forward, so they just see the splash screen again.

### Root Cause
In both `Auth.tsx` and `AuthPromptDialog.tsx`, the Google (and Apple) OAuth calls set:
```
redirect_uri: window.location.origin
```
This resolves to the root URL `/`, which renders `SplashPage` -- a component with no auth-state handling.

### Fix
Change the `redirect_uri` to point back to `/auth` instead of `/`. The Auth page already has a `useEffect` that detects authenticated users and redirects them to the correct dashboard based on their role.

### Files to Change

**1. `src/pages/auth/Auth.tsx`**
- `handleGoogleSignIn`: Change `redirect_uri` from `window.location.origin` to `window.location.origin + "/auth"`
- `handleAppleSignIn`: Same change

**2. `src/features/trip-planner/components/AuthPromptDialog.tsx`**
- `handleGoogleSignIn`: Change `redirect_uri` from `window.location.origin` to `window.location.origin + "/auth"`
- `handleAppleSignIn`: Same change

### Why This Works
The `/auth` page already has logic (lines 42-78) that checks if the user is authenticated after OAuth and redirects them to the appropriate dashboard (host, vendor, or guest). It also handles saving pending roles from `localStorage` (lines 81-97). Redirecting back to `/auth` lets all this existing logic run correctly.

