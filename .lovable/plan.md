
## Fix Restaurant Cards in /appview

### Problems
1. **Size mismatch**: Restaurant cards use `RestaurantCard` which renders at `w-[200px]` with text below the image. Experience cards use inline `w-36` with an overlay gradient style. They look completely different side by side.
2. **UI style mismatch**: Experience cards show name/rating/price overlaid on the image with a gradient. Restaurant cards show a separate text block underneath.
3. **Duplicate images for ARCA and Hartwood**: Both restaurants share nearly identical coordinates (km 7.6 on the same road), so the Google Photos API may return the same or similar images for both.

### Solution

**1. Switch to `RestaurantCardWithGoogleRating` in AppView**

Replace `RestaurantCard` with the existing `RestaurantCardWithGoogleRating` component, which already:
- Uses `w-36` width (matches experience cards)
- Has the overlay gradient style (name, rating, price over the image)
- Fetches Google photos and uses them as covers
- Matches the experience card UI perfectly

**2. Fix ARCA / Hartwood duplicate images**

Since both restaurants are at nearly identical GPS coordinates, the Google Places API may return the same result for both. To fix this, the `RestaurantCardWithGoogleRating` component includes the restaurant name in its search query, which should differentiate them. If the static fallback photos are also the same, we'll verify the imported images (`arca-tulum.jpg` vs `hartwood-tulum.jpg`) are distinct files.

### Technical Details

**File: `src/pages/guest/AppView.tsx`**
- Replace `RestaurantCard` import with `RestaurantCardWithGoogleRating`
- Change the curated restaurants render from:
  ```
  <RestaurantCard key={restaurant.id} restaurant={restaurant} size="small" />
  ```
  to:
  ```
  <RestaurantCardWithGoogleRating
    key={restaurant.id}
    restaurant={restaurant}
    index={vendorRestaurants.length + index}
  />
  ```
- Remove unused `RestaurantCard` import

**File: `src/components/RestaurantCardWithGoogleRating.tsx`** (if needed)
- Verify the search query includes enough unique info (restaurant name + address) to distinguish restaurants at similar coordinates like ARCA vs Hartwood

This is a small swap that aligns restaurant cards with the experience card UI already used in AppView.
