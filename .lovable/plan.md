

## Use Google Photos as Restaurant Card Cover

### Problem
Restaurant cards on the `/restaurants` listing page show the static mock photo, but when you click into a restaurant's profile, it displays richer Google-sourced photos. We want the card cover to match what you see inside the profile.

### How It Works Today
- `RestaurantCard` displays `restaurant.photos[0]` (the static mock image)
- `RestaurantDetail` fetches Google Photos via the `google-reviews` edge function and caches them in localStorage under `google_reviews_detail_{id}`
- Once cached, the detail page shows Google photos instead of mock photos

### Solution
Update `RestaurantCard` to check localStorage for cached Google photos. If a user has previously visited a restaurant's detail page, the card will use the first cached Google photo as its cover. Otherwise, it falls back to the existing mock photo.

### Technical Changes

**File: `src/components/RestaurantCard.tsx`**
- On mount, check `localStorage` for `google_reviews_detail_{restaurant.id}`
- If cached data exists and contains photos, use the first Google photo as the card image
- Fall back to `restaurant.photos[0]` if no cache exists
- Add a `coverPhoto` state variable initialized from cache or mock data

This is a lightweight change -- no new API calls, no new dependencies. Cards will progressively show Google photos as users browse restaurant profiles.

