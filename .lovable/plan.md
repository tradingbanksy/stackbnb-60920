

## Fix: Remove Stock Images from Restaurant Cards on AppView

### Problem
The curated restaurant cards on `/appview` still fall back to `restaurant.photos[0]` (a static mock asset) when no Google photo cache exists in `localStorage`. This means users see stock demo images instead of real photos.

### Solution
Apply the same pattern used on the restaurant detail page: never show mock photos. Instead, show a loading skeleton while fetching Google photos, and only display real Google-sourced images.

### Technical Details

**File: `src/pages/guest/AppView.tsx`**

1. **Add state and fetch logic** for Google photos for curated restaurants. Create a `useEffect` that iterates over `curatedRestaurants`, checks the `localStorage` cache for each, and fetches from the `google-reviews` edge function if not cached. Store results in a `Record<string, string>` map (restaurant ID → photo URL).

2. **Replace the inline photo logic** (lines 504-512) — instead of defaulting to `restaurant.photos[0]`, look up the photo from the state map. If no photo is available yet, render a skeleton placeholder (same `w-36 aspect-square` with `animate-pulse`) instead of the card image.

3. **Card rendering** (lines 514-539):
   - If a Google photo exists in the map → render the card as-is with that photo
   - If no photo yet → render a skeleton square with the restaurant name overlay (no mock image)

This ensures zero mock/stock images appear — only real Google photos or a loading skeleton.

