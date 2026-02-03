
# Plan: Fix Stripe Connect Button in Host Dashboard

## Problem Analysis
When clicking the "Connect" button on the Host Dashboard, the page navigates to a blank screen with a sad document image. This happens because:

1. The Dashboard uses `window.location.href = data.url` to navigate directly to Stripe
2. If the Stripe page has any loading issues or session problems, the user is stuck on a blank page
3. The PaymentSettings page uses `window.open(data.url, '_blank')` which works better by keeping the app open

## Solution
Update the Dashboard's `handleConnectStripe` function to match the PaymentSettings behavior:
- Open Stripe in a new tab instead of replacing the current page
- Show a toast message guiding the user
- Reset the loading state properly

## Changes Required

### File: `src/pages/host/Dashboard.tsx`

**Update the `handleConnectStripe` function (around lines 168-184):**

```text
Current code:
  if (data?.url) {
    window.location.href = data.url;
  }

New code:
  if (data?.url) {
    window.open(data.url, '_blank');
    toast.success('Stripe setup opened in a new tab. Complete the setup there, then refresh this page.');
    setIsConnecting(false);
  }
```

Also add proper error reset:
```text
Current code (catch block):
  } catch (error) {
    console.error('Error connecting Stripe:', error);
    toast.error('Failed to start Stripe onboarding');
    setIsConnecting(false);
  }

Stays the same - just ensure setIsConnecting(false) is called in the success case too.
```

## Technical Details

| Aspect | Current Behavior | New Behavior |
|--------|------------------|--------------|
| Navigation | Replaces current page | Opens new tab |
| App state | Lost on navigation | Preserved |
| Error recovery | User stuck on blank page | User can retry from dashboard |
| Loading state | Never reset on success | Properly reset |

## Why This Works
- The backend is functioning correctly (confirmed in logs)
- The PaymentSettings page uses this exact pattern and works
- Opening in a new tab is more user-friendly for external Stripe onboarding
- Users can easily return to the dashboard if something goes wrong
