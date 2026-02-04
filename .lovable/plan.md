
# Plan: City-Based Restaurant & Vendor Filtering

## Overview

This plan will ensure AppView consistently displays Tulum content (curated restaurants + verified vendors) when Tulum is selected, and dynamically updates all content when a user switches to a different city.

## Current State Analysis

Your **mockRestaurants.ts** contains real, top-rated Tulum restaurants (ARCA, Hartwood, Burrito Amor, etc.) - these are not fake data, just locally curated. However, they're currently only used on the `/restaurants` page as a fallback.

The **AppView** page only shows verified `vendor_profiles` from the database, but these vendors don't have a `city` field, so there's no way to filter them by location.

## Implementation Strategy

### Phase 1: Database Changes

Add a `city` column to the `vendor_profiles` table to associate vendors with specific locations:

```text
vendor_profiles
├── id (uuid)
├── name (text)
├── category (text)
├── city (text) ← NEW: "Tulum", "Cancun", "Playa del Carmen", etc.
├── ...existing columns
```

### Phase 2: Supported Cities Configuration

Create a cities configuration file that stores:
- City name
- Coordinates (for TripAdvisor API searches)
- Display name
- Default/active status

```text
src/lib/supportedCities.ts

SUPPORTED_CITIES = [
  { id: "tulum", name: "Tulum", lat: 20.2114, lng: -87.4654 },
  { id: "cancun", name: "Cancún", lat: 21.1619, lng: -86.8515 },
  { id: "playa-del-carmen", name: "Playa del Carmen", lat: 20.6296, lng: -87.0739 },
]
```

### Phase 3: Enhanced SearchContext

Update `SearchContext` to make destination selectable instead of hardcoded:

- Add `setDestination` function
- Store selected city in sessionStorage for persistence
- Provide city coordinates for API calls

### Phase 4: AppView UI Updates

**Search Bar Changes:**
- Convert the static "Tulum" text to a dropdown selector
- Populate dropdown with supported cities
- When a city is selected, filter all content accordingly

**Restaurant Section:**
- Show curated Tulum restaurants (from `mockRestaurants.ts`) when Tulum is selected
- Filter curated restaurants by city for other locations (will need to expand the curated data later)
- Also display vendor restaurants filtered by the selected city

**Experience Section:**
- Filter vendor experiences by the selected city

### Phase 5: Data Flow

```text
User selects city in search bar
         ↓
SearchContext updates destination + coordinates
         ↓
AppView re-fetches/filters:
  ├── Curated restaurants (filtered by city)
  ├── Vendor restaurants (filtered by city from DB)
  └── Vendor experiences (filtered by city from DB)
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/...` | Create | Add `city` column to `vendor_profiles` |
| `src/lib/supportedCities.ts` | Create | Cities configuration with coordinates |
| `src/contexts/SearchContext.tsx` | Modify | Make destination selectable, add coordinates |
| `src/pages/guest/AppView.tsx` | Modify | Add city dropdown, filter vendors by city, show curated restaurants |
| `src/data/mockRestaurants.ts` | Rename (optional) | Rename to `curatedRestaurants.ts` for clarity |

## Technical Details

### Database Migration

```sql
ALTER TABLE vendor_profiles 
ADD COLUMN city text DEFAULT 'Tulum';

-- Update existing vendors to default city
UPDATE vendor_profiles SET city = 'Tulum' WHERE city IS NULL;
```

### City Dropdown Component

The search bar will include a city selector that:
1. Shows current city with a dropdown chevron
2. Opens a popover/dropdown with all supported cities
3. Updates SearchContext when a city is selected
4. Triggers content refresh

### Content Filtering Logic

```text
// Curated restaurants
filteredCuratedRestaurants = curatedRestaurants.filter(r => 
  r.city.toLowerCase() === selectedCity.toLowerCase()
);

// Vendor restaurants (from database)
fetchPublishedVendors = supabase
  .from('vendor_profiles')
  .select('...')
  .eq('is_published', true)
  .eq('city', selectedCity);  // NEW filter
```

## Future Scalability

When adding a new city (e.g., "Cancún"):

1. Add city to `supportedCities.ts` with coordinates
2. Add curated restaurants for that city to the data file
3. Vendors who sign up can select their city during onboarding
4. AppView automatically shows correct content when user selects that city

## Summary

This approach gives you:
- Consistent Tulum content display (curated + verified vendors)
- Easy multi-city expansion
- Single source of truth for city configuration
- Seamless user experience with instant filtering
