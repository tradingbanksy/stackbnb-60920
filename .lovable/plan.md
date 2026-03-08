

## Fix: Remove Flash of Mock Image on Restaurant Profile

### Problem
When opening a restaurant profile, the static mock image (e.g., `burrito-amor-tulum.jpg`) briefly appears before the correct Google photos load in. This happens because the code sets `displayPhotos` to the mock photos first (line 119), then checks the cache and updates photos separately (lines 124-130).

### Solution
Combine the logic so that when finding the restaurant, we immediately check the Google cache and use those photos from the start -- never showing the mock image if cached Google photos exist.

### Technical Details

**File: `src/pages/guest/RestaurantDetail.tsx`**

In the first `useEffect` (lines 109-132), restructure the photo initialization:

1. Find the restaurant
2. Immediately check the Google reviews cache
3. If cached Google photos exist, use those as `displayPhotos` from the start
4. Only fall back to `restaurant.photos` if no cached photos are available
5. Set `googleReviews` state from cache as before

This eliminates the brief moment where mock photos are visible before being replaced by cached Google photos.

