

# Plan: Codebase Cleanup and Quality Improvements

## Overview

This plan addresses code quality issues, missing infrastructure, and organizational improvements to make the Stackd codebase more maintainable and production-ready.

## Changes Summary

| Area | Issue | Solution |
|------|-------|----------|
| Debug Logs | 97 console.log statements | Remove or convert to proper logging |
| TODO Comments | 1 unfinished feature | Implement or document |
| Duplicate Pages | 2 experience detail pages | Keep one, remove duplicate |
| Error Handling | No error boundaries | Add React error boundary |
| PWA Support | No manifest.json | Create web app manifest |
| Constants | No centralized config | Add constants file |
| Loading States | No shared skeleton | Already exists, verify usage |

---

## Step 1: Remove Debug Console Logs

Remove unnecessary console.log statements from 8 files:

**Files to clean:**
- `src/services/tripadvisorService.ts` - 3 logs
- `src/hooks/useAuth.ts` - 5 logs  
- `src/hooks/useNearbyPlaces.ts` - 1 log
- `src/pages/Auth.tsx` - 1 log
- `src/pages/SharedItinerary.tsx` - 1 log
- `src/features/trip-planner/hooks/useItinerarySync.ts` - 7 logs
- `src/features/trip-planner/context/ItineraryContext.tsx` - 2 logs
- `src/features/trip-planner/components/ItineraryDaySchedule.tsx` - 1 log

**Approach:** Remove console.log statements entirely. For critical debugging paths, keep as comments or use a proper logger utility.

---

## Step 2: Address TODO Comment

**File:** `src/features/trip-planner/components/ItineraryDaySchedule.tsx`

Current code:
```typescript
const handleReplace = useCallback(() => {
  // TODO: Open a dialog to find alternative activities
  console.log("Replace activity:", item.title);
}, [item.title]);
```

**Solution:** Show a toast message explaining the feature is coming soon instead of doing nothing.

---

## Step 3: Remove Duplicate Experience Page

**Keep:** `src/pages/ExperienceDetailsPage.tsx` (dynamic, uses mockData)
**Remove:** `src/pages/ExperienceDetails.tsx` (hardcoded content, unused)

The `ExperienceDetailsPage.tsx` is the active page used in routes. The `ExperienceDetails.tsx` has hardcoded Miami Beach content and is not referenced in the router.

---

## Step 4: Add Error Boundary Component

Create a React error boundary to catch and gracefully handle runtime errors.

**New file:** `src/components/ErrorBoundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service in production
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="m-4 p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We're sorry, but something unexpected happened.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
```

**Update:** Wrap the app in `App.tsx` with the ErrorBoundary component.

---

## Step 5: Add PWA Manifest

Create a web app manifest for PWA support.

**New file:** `public/manifest.json`

```json
{
  "name": "Stackd - Local Experiences",
  "short_name": "Stackd",
  "description": "Discover curated local experiences recommended by vacation rental hosts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-196.png", "sizes": "196x196", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-256.png", "sizes": "256x256", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["travel", "lifestyle"]
}
```

**Update:** Add manifest link to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

---

## Step 6: Add Constants File

Create a centralized constants file for configuration values.

**New file:** `src/lib/constants.ts`

```typescript
// App configuration
export const APP_CONFIG = {
  name: 'Stackd',
  tagline: 'Local Experiences',
  description: 'Curated local experiences recommended by vacation rental hosts',
} as const;

// API endpoints (relative to Supabase functions)
export const API_ENDPOINTS = {
  tripPlannerChat: 'trip-planner-chat',
  googleReviews: 'google-reviews',
  priceComparison: 'price-comparison',
  vendorDirections: 'vendor-directions',
  mapboxDirections: 'mapbox-directions',
} as const;

// UI constants
export const UI_CONSTANTS = {
  maxMobileWidth: 375,
  defaultPageSize: 20,
  toastDuration: 4000,
} as const;

// Commission rates
export const COMMISSION_RATES = {
  default: 15,
  premium: 20,
  host: 10,
} as const;

// Cache durations (milliseconds)
export const CACHE_DURATIONS = {
  restaurants: 5 * 60 * 1000,  // 5 minutes
  experiences: 10 * 60 * 1000, // 10 minutes
  reviews: 30 * 60 * 1000,     // 30 minutes
} as const;
```

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/services/tripadvisorService.ts` |
| Modify | `src/hooks/useAuth.ts` |
| Modify | `src/hooks/useNearbyPlaces.ts` |
| Modify | `src/pages/Auth.tsx` |
| Modify | `src/pages/SharedItinerary.tsx` |
| Modify | `src/features/trip-planner/hooks/useItinerarySync.ts` |
| Modify | `src/features/trip-planner/context/ItineraryContext.tsx` |
| Modify | `src/features/trip-planner/components/ItineraryDaySchedule.tsx` |
| Delete | `src/pages/ExperienceDetails.tsx` |
| Create | `src/components/ErrorBoundary.tsx` |
| Modify | `src/App.tsx` (wrap with ErrorBoundary) |
| Create | `public/manifest.json` |
| Modify | `index.html` (add manifest link) |
| Create | `src/lib/constants.ts` |

---

## Result

After implementation:
- Clean production-ready code without debug logs
- Graceful error handling with user-friendly recovery
- PWA-ready with proper manifest
- Centralized configuration for easier maintenance
- No duplicate or dead code

