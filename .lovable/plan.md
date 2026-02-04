
# Plan: Fix City Dropdown Centering, Add Curated Restaurants for All Cities, and Enable Reservations

## Issues Identified

1. **City Dropdown Not Centered**: The current search bar layout has the city dropdown left-aligned after the MapPin icon, not centered between the GPS icon and calendar
2. **No Restaurants for Cancun/Playa del Carmen**: The `mockRestaurants.ts` file only contains Tulum restaurants - switching cities shows "No restaurants available"
3. **Reservation Flow**: Curated restaurants already have reservation platform data (Resy, OpenTable) but many don't have `reservationUrl` populated - the system falls back to "Call to Book"

## Solution Overview

### Phase 1: Center City Dropdown in Search Bar

Current layout:
```text
[MapPin] [City ▼] | [Calendar] [Date] [Search]
```

Updated layout to center the city:
```text
[MapPin] ─────── [City ▼] ─────── [Calendar] [Date] [Search]
```

**Changes to `AppView.tsx`:**
- Restructure the search bar flex container
- Use `justify-center` and proper spacing to center the city dropdown
- Keep MapPin and CalendarDays as bookends with the city selector in the middle

### Phase 2: Add Curated Restaurants for Cancun and Playa del Carmen

Add 4-6 top-rated restaurants for each new city to `mockRestaurants.ts`:

**Cancun Restaurants:**
- Lorenzillo's (Seafood, $$$$)
- Harry's Prime Steakhouse (Steakhouse, $$$$)
- Puerto Madero (Seafood/Steakhouse, $$$)
- La Habichuela Sunset (Yucatecan, $$$)
- Thai Lounge (Thai/Asian Fusion, $$)
- Tacos Rigo (Mexican, $)

**Playa del Carmen Restaurants:**
- Alux Restaurant (Mexican/Cenote, $$$$)
- Catch Playa (Seafood, $$$)
- La Cueva del Chango (Mexican Breakfast, $$)
- Carboncitos (Mexican/Tacos, $)
- El Fogon (Authentic Tacos, $)
- Oh La La (French, $$$)

Each restaurant will include:
- Full address, coordinates
- Hours, phone, features
- Reservation platform (Resy/OpenTable/Yelp) where applicable
- Working `reservationUrl` for online booking

### Phase 3: Add Reservation URLs

Update existing Tulum restaurants and new city restaurants with actual reservation URLs:

| Restaurant | Platform | URL Pattern |
|------------|----------|-------------|
| ARCA | Resy | `https://resy.com/cities/tulum/arca` |
| Hartwood | OpenTable | `https://www.opentable.com/r/hartwood-tulum` |
| Kitchen Table | Resy | `https://resy.com/cities/tulum/kitchen-table` |
| Lorenzillo's | OpenTable | `https://www.opentable.com/r/lorenzillos-cancun` |

Note: Some casual restaurants (taquerias, beach bars) will remain "Call to Book" as they don't take online reservations.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/guest/AppView.tsx` | Restructure search bar to center city dropdown between icons |
| `src/data/mockRestaurants.ts` | Add 10-12 new restaurants for Cancun and Playa del Carmen, add reservationUrls to existing entries |

## Technical Details

### Search Bar Layout Update

```tsx
// Updated search bar structure
<div className="relative bg-card/90 rounded-full border flex items-center px-3 py-2">
  {/* Left: Location icon */}
  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
  
  {/* Center: City Dropdown - takes available space and centers */}
  <div className="flex-1 flex justify-center">
    <Popover>
      <PopoverTrigger>
        <button className="flex items-center gap-1 text-xs">
          <span>{destination}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      ...
    </Popover>
  </div>
  
  <div className="h-4 w-px bg-border/50" />
  
  {/* Right: Date picker */}
  <Popover>
    <PopoverTrigger>
      <button className="flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4 text-primary" />
        <span>{selectedDate ? format(...) : "When?"}</span>
      </button>
    </PopoverTrigger>
    ...
  </Popover>
  
  <button className="bg-gradient-to-r ...">
    <Search className="h-3 w-3" />
  </button>
</div>
```

### New Restaurant Data Structure

```typescript
// Example Cancun restaurant
{
  id: 'c1',
  name: "Lorenzillo's",
  cuisine: "Seafood",
  rating: 4.6,
  reviewCount: 4521,
  priceRange: '$$$$',
  address: "Blvd. Kukulcan Km 10.5, Zona Hotelera",
  neighborhood: "Hotel Zone",
  city: "Cancún",
  zipCode: "77500",
  phone: "+52 998 883 1254",
  hours: { ... },
  description: "World-famous lobster house since 1983...",
  photos: [lorenzillosCancun],
  features: ["Waterfront", "Live Lobster Tank", "Fine Dining"],
  hasOutdoorSeating: true,
  reservationPlatform: 'opentable',
  reservationUrl: 'https://www.opentable.com/r/lorenzillos-cancun',
  coordinates: { lat: 21.1021, lng: -86.7709 },
}
```

## Reservation Flow

When a guest clicks "Reserve Table":
1. If `reservationUrl` exists: Opens in-app webview with the booking page
2. The selected date from SearchContext is automatically appended to the URL
3. Guest completes booking on Resy/OpenTable within the app
4. If no `reservationUrl`: Falls back to phone call

## Image Assets

For the new cities, I'll use existing restaurant images from `src/assets/restaurants/` that match the cuisine types:
- Fine dining images for upscale restaurants
- Seafood images for seafood restaurants
- Mexican images for local taquerias
- Mediterranean/French images where appropriate

## Summary

This plan will:
1. Center the city dropdown properly in the search bar for better visual balance
2. Populate Cancun and Playa del Carmen with real, curated restaurant data
3. Add functional reservation URLs so guests can book directly through the app
4. Maintain the existing "Call to Book" fallback for casual spots that don't take online reservations
