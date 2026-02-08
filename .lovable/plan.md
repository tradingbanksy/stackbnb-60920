
## Add Google Reviews Preview to Vendor Profiles

### Overview

When a vendor has reviews available through Google or Airbnb, show a preview of those reviews directly on the profile page so guests can see social proof at a glance -- without needing to click external links.

### Current State

- **Airbnb reviews**: Already rendered as horizontally scrolling cards on the profile when the `airbnb_reviews` field has data. Currently no vendors have reviews populated, but the UI is ready.
- **Google reviews**: The backend function (`google-reviews`) already fetches reviews from Google using a vendor's `google_place_id`, but the results are not displayed on the profile page. Currently no vendors have a `google_place_id` set either, but once they do this will work automatically.

### What Changes

**New Component: `GoogleReviewsPreview`**

A new reusable component that:
1. Takes a `google_place_id` as a prop
2. Calls the existing `google-reviews` backend function to fetch reviews
3. Displays up to 5 reviews in the same horizontally scrolling card style used for Airbnb reviews and platform guest reviews (consistent with the unified design system)
4. Shows a loading skeleton while fetching
5. Shows nothing if no reviews are found or no `google_place_id` is provided
6. Includes a "View all on Google" link at the bottom

Each review card will display:
- Reviewer name and profile photo (or initials fallback)
- Star rating (1-5 stars)
- Relative time ("2 months ago")
- Review text (truncated to 4 lines)

**Files to modify:**

1. **`src/components/GoogleReviewsPreview.tsx`** (new file)
   - Self-contained component that fetches and renders Google reviews
   - Uses the existing `google-reviews` backend function via the Supabase client
   - Matches the horizontal scroll card layout already used for Airbnb reviews and VendorReviews

2. **`src/pages/vendor/PublicProfile.tsx`**
   - Import `GoogleReviewsPreview`
   - Add a new section between the existing Guest Reviews and Airbnb Reviews sections
   - Only renders when `profile.google_place_id` exists

3. **`src/pages/vendor/ProfilePreview.tsx`**
   - Same addition as PublicProfile for consistency

### What Stays the Same

- The existing Airbnb Reviews section remains unchanged
- The existing platform Guest Reviews (`VendorReviews` component) remains unchanged
- The `google-reviews` backend function is not modified -- it already returns everything needed
- No database changes required
- External link buttons in the links section remain as they are

### Technical Details

The `google-reviews` backend function already returns this structure:
```text
{
  reviews: [
    { author_name, profile_photo_url, rating, relative_time_description, text }
  ],
  rating: number,
  totalReviews: number,
  googleMapsUrl: string
}
```

The new component will call:
```text
supabase.functions.invoke('google-reviews', { body: { placeId } })
```

Review cards will follow the same 260px-wide, snap-scrolling pattern used throughout the profile page, keeping the visual language consistent.
