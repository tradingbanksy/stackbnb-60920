

# Plan: Fix Restaurant Detail Page & Enable Google Images

## Issues Found

1. **404 Error (Root Cause)**: In `AppView.tsx` line 505, curated restaurants link to `/restaurants/${restaurant.id}` (plural) but the route defined in `App.tsx` is `/restaurant/:id` (singular). This is why clicking any restaurant shows a 404 page instead of the detail view with reviews.

2. **Restaurant Images**: Currently using local assets from `src/assets/restaurants/`. To pull images from Google, we need to enhance the `google-reviews` edge function to also return photos.

## Solution

### Phase 1: Fix the Routing Bug (Critical)

Change the link path in `AppView.tsx` from plural to singular:

```text
Line 505: /restaurants/${restaurant.id}  →  /restaurant/${restaurant.id}
```

This single character fix will restore the full restaurant detail page with all the reviews, hours, location, and reservation UI that was already built.

### Phase 2: Add Google Photos to Edge Function

Enhance the `google-reviews` edge function to also fetch place photos from Google Places API:

**Current Response:**
- placeId, name, rating, totalReviews, reviews, googleMapsUrl

**Enhanced Response:**
- placeId, name, rating, totalReviews, reviews, googleMapsUrl
- **photos** (array of Google photo URLs)

The Google Places API returns photo references that need to be converted to URLs using the Place Photos endpoint.

### Phase 3: Display Google Photos in Restaurant Detail

Update `RestaurantDetail.tsx` to use Google photos when available:

1. Store photos from Google API response
2. Replace local `restaurant.photos` with Google photos when available
3. Fall back to local photos if Google API fails

### Phase 4: Cache Google Photos in Restaurant Cards

Update `RestaurantCardWithGoogleRating.tsx` to also fetch and display the Google photo for the card thumbnail, with 24-hour caching.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/guest/AppView.tsx` | Fix route: `/restaurants/` → `/restaurant/` |
| `supabase/functions/google-reviews/index.ts` | Add photo fetching from Google Places API |
| `src/pages/guest/RestaurantDetail.tsx` | Use Google photos when available |
| `src/components/RestaurantCardWithGoogleRating.tsx` | Display Google photo in card thumbnail |

## Technical Details

### Google Places Photo API

The Google Places API returns photo references in the place details response. To get actual photo URLs:

```text
https://maps.googleapis.com/maps/api/place/photo
  ?maxwidth=800
  &photo_reference={photo_reference}
  &key={API_KEY}
```

The edge function will convert these references to full URLs before returning to the client.

### Photo Data Structure

```typescript
interface GoogleReviewsResponse {
  placeId: string;
  name: string;
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  googleMapsUrl: string;
  photos: string[];  // NEW: Array of photo URLs
}
```

### Fallback Strategy

1. Try to fetch Google photos via edge function
2. If photos exist in response, use them for the image gallery
3. If no photos or API fails, fall back to local curated images

## Summary

This plan will:
1. **Immediately fix the 404 bug** so restaurant detail pages work again with all the reviews and UI you built
2. **Pull restaurant photos from Google** to show authentic, up-to-date images
3. **Maintain fallbacks** so restaurants without Google data still display correctly

