

# Plan: Remove Mock Data and Split Verified Vendors into Two Rows

## Summary
Remove all mock experience data from the `/explore` page and display only verified vendors from the database. The verified vendors will be split evenly across two horizontal scrolling rows for better visual distribution.

## Current State
- **First row**: Shows real vendor profiles fetched from `vendor_profiles` table
- **Second row**: Shows mock experiences from `mockData.ts` (Hot Air Balloon Ride, Wine Tasting Tour, Snorkeling Adventure, etc.)
- Both rows use horizontal scrolling

## Changes Required

### File: `src/pages/guest/Explore.tsx`

**1. Remove mock data imports (lines 7-8)**
```typescript
// DELETE these lines:
import { experiences } from "@/data/mockData";
import { mockRestaurants } from "@/data/mockRestaurants";
```

**2. Remove mock filtering logic (lines 167-185)**
Delete the `filteredExperiences` and `filteredRestaurants` filter functions that process mock data.

**3. Update Experiences Tab (lines 344-438)**
Replace the current two-row structure with:
- Split `filteredVendorExperiences` into two halves using `Math.ceil()`
- Render first half in row 1
- Render second half in row 2
- Keep the same card styling and functionality

**4. Update Restaurants Tab (lines 464-484)**
- Fetch restaurant vendor profiles from database (those with `listing_type: 'restaurant'`)
- Split them evenly into two rows similar to experiences
- Remove mock restaurant rendering

**5. Update empty state checks**
Update the "No experiences found" and "No restaurants found" conditions to only check database vendors.

## Implementation Details

### Splitting Logic
```typescript
// For experiences
const firstHalf = filteredVendorExperiences.slice(0, Math.ceil(filteredVendorExperiences.length / 2));
const secondHalf = filteredVendorExperiences.slice(Math.ceil(filteredVendorExperiences.length / 2));

// Render firstHalf in Row 1, secondHalf in Row 2
```

### Visual Result
| Before | After |
|--------|-------|
| Row 1: Real vendors | Row 1: First half of verified vendors |
| Row 2: Mock data (balloon, wine, etc.) | Row 2: Second half of verified vendors |

## Files to Modify
1. `src/pages/guest/Explore.tsx`

## Notes
- The existing Supabase query already filters for `is_published: true`, ensuring only verified vendors appear
- Restaurant tab will also need updating to use real data instead of mock restaurants
- If there's only 1 vendor, it will appear in row 1 with row 2 empty
- If there are 0 vendors, the "No experiences found" message will display

