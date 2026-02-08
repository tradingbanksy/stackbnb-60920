
## Rename "Google Reviews" to "Airbnb Reviews" and Add a Real Google Reviews Link

### What Changes

The current "Google Reviews" button in the External Links section actually links to Airbnb for some vendors (using the `google_reviews_url` field). We will:

1. **Rename** the existing `google_reviews_url` button from "Google Reviews" to "Airbnb Reviews" (with a matching icon swap)
2. **Add a new "Google Reviews" button** that links to the vendor's actual Google profile using their `google_place_id`

The Google profile URL will be constructed as:
`https://www.google.com/maps/place/?q=place_id:{google_place_id}`

### Files to Modify

**1. `src/pages/vendor/PublicProfile.tsx`** (External Links section, lines ~466-505):
- Rename the `google_reviews_url` button label from "Google Reviews" to "Airbnb Reviews"
- Change its icon from `Star` to `ExternalLink` (to differentiate from the real Google link)
- Add a new "Google Reviews" button that uses `google_place_id` to link to the Google Maps profile, shown only when `google_place_id` exists
- The new button keeps the `Star` icon

**2. `src/pages/vendor/ProfilePreview.tsx`** (External Links section, lines ~576-613):
- Same changes: rename existing button to "Airbnb Reviews", add new Google Reviews button using `google_place_id`

### What Stays the Same
- All other sections on both pages remain untouched
- The `google_reviews_url` field continues to be used as-is (just relabeled)
- No database changes needed
