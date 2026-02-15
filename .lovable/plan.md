

## Fix Restaurant Images in /appview

### Problem
The `/appview` page renders restaurant images directly using `restaurant.photos[0]` (static mock photos) instead of using the `RestaurantCard` component. Meanwhile, the `/restaurants` page and detail pages show Google-sourced photos. This causes a mismatch between what users see on the home screen vs. when they click into a restaurant profile.

### Solution
Replace the inline restaurant card markup in `AppView.tsx` (lines ~502-529) with the existing `RestaurantCard` component, which already handles Google photo fetching and caching.

### Technical Details

**File: `src/pages/guest/AppView.tsx`**
- Replace the inline `<Link>` + `<BlurImage>` block for curated restaurants (~lines 502-529) with `<RestaurantCard restaurant={restaurant} size="small" />`
- The `RestaurantCard` component (with `size="small"` and default `horizontal` variant) already:
  - Checks localStorage for cached Google photos
  - Fetches Google photos via the `google-reviews` edge function if not cached
  - Falls back to static mock photos gracefully
- Import `RestaurantCard` at the top of the file

This is a small change -- swapping ~25 lines of inline markup for a single component that already exists and handles the photo logic correctly.

