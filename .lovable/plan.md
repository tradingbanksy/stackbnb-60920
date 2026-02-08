

## Simplify "Where You'll Meet" to Match Airbnb Style

### What Changes

The `VendorLocationMap` component in `pin` mode currently shows too much below the map -- the vendor name with a location icon, a "Get Directions" button, and a bookmark button. The Airbnb style is much cleaner: just the map with a pin, and an "Open in Maps" link overlay on the map itself. The meeting point text and city are already shown separately in the profile page layout, so the component just needs to be the map.

### Visual Comparison

| Current | Target (Airbnb-style) |
|---------|----------------------|
| Map + Open in Maps overlay | Map + Open in Maps overlay (keep) |
| Vendor name with pin icon below map | Remove |
| Get Directions + Bookmark buttons | Remove |
| Card wrapper with gradient | Clean rounded container, no card chrome |

### File to Modify

**`src/components/VendorLocationMap.tsx`** -- In `pin` mode only:

1. Remove the entire bottom section below the map (lines ~740-901) that contains:
   - The vendor name row with the gradient pin icon
   - The "Get Directions" button
   - The bookmark/save-to-itinerary button
2. Remove the Card wrapper -- render just the map container with rounded corners and the "Open in Maps" overlay
3. Keep the "Open in Maps" button on the map itself (already there)
4. The loading skeleton should also be simplified for pin mode -- just show a map-sized placeholder without the card content below

This change only affects `pin` mode -- the full `directions` mode used elsewhere (trip planner, itinerary) will remain unchanged with all its features intact.

### What Stays the Same

- The map itself with the red pin marker
- The "Open in Maps" overlay button on the map
- The `meeting_point_description` and `city` text are rendered separately in `PublicProfile.tsx` and `ProfilePreview.tsx`, so they will still appear below the map
- The full `directions` mode with route, turn-by-turn, tips, and buttons remains untouched
- All vendors will see this same clean map layout since both profile pages already pass `mode="pin"`

