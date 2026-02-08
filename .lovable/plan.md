

## Fix Google Review Link and Add Airbnb Link Field to Vendor Profile Editor

### Problem 1: Google Review Link Blocked

The "View all on Google" link in the `GoogleReviewsPreview` component uses a standard `<a href="..." target="_blank">` tag, which should work fine. However, the **external link buttons** in the bottom section of the vendor public profile (lines 504-524 of `PublicProfile.tsx`) use a programmatic `openExternalLink()` helper that creates and clicks a dynamically-generated anchor element. This approach can be blocked by some browsers as a popup.

**Fix:** Replace the programmatic `openExternalLink()` calls for Google Reviews and Airbnb Reviews buttons with standard `<a>` tags styled as buttons. This ensures the browser treats them as direct user-initiated navigations, not popups.

### Problem 2: Vendors Can't Paste Their Airbnb Link

Currently, the vendor profile editor (`CreateProfile.tsx`) has an "Airbnb Experience Reviews" section that only lets vendors paste a URL and then click "Import" to scrape reviews via Firecrawl. However:
- The Airbnb URL (`airbnb_experience_url`) is already saved to the database on form submit
- But there's no clear way for vendors to simply **save their Airbnb link** without needing to scrape -- the URL is only stored if the form is submitted
- The existing Airbnb button on the public profile (labeled "Airbnb Reviews") points to `google_reviews_url`, which is confusing

**Fix:** 
1. Keep the existing Airbnb URL input field in the editor -- it already saves to `airbnb_experience_url` on submit, which is correct
2. Update the external links section in `PublicProfile.tsx` to show a proper "View on Airbnb" button that links to `airbnb_experience_url` (instead of the current mislabeled button using `google_reviews_url`)
3. Make the Airbnb link button use a standard `<a>` tag to avoid popup blocking

### Technical Changes

**File: `src/pages/vendor/PublicProfile.tsx`**
- Replace all `openExternalLink()` calls in the external links section with native `<a>` tags wrapped in button styling
- Fix the "Airbnb Reviews" button to use `airbnb_experience_url` instead of `google_reviews_url`
- Also fix the "View all on Airbnb" link in the Airbnb reviews section to use an `<a>` tag

**File: `src/components/GoogleReviewsPreview.tsx`**
- No changes needed -- it already uses a proper `<a>` tag

**File: `src/pages/vendor/CreateProfile.tsx`**
- No structural changes needed -- it already has the Airbnb URL input and saves it correctly
- Optionally improve the label/description to make it clearer the link will be saved and shown on their profile

