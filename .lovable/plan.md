

# Update OG Image to Branded Stackd Image

## What's Changing

The `index.html` file currently points to a generic Lovable placeholder image for social media previews (the image that shows up when you share your link on Twitter, Facebook, LinkedIn, iMessage, etc.). We'll replace it with your own Stackd branding.

## Approach

Since the OG image needs to be a publicly accessible URL (not a bundled asset), we'll move your existing `stackd-logo-new.png` into the `public/` folder so it's served at a fixed URL. Then we'll update the two meta tags in `index.html` to point to it.

If you'd prefer a custom OG banner image (typically 1200x630px) instead of just the logo, you can upload one and we'll use that instead. For now, we'll use your existing logo.

## Changes

### 1. Copy logo to public folder
- Place `stackd-logo-new.png` into `public/` so it's available at `/stackd-logo-new.png`

### 2. Update `index.html` (2 lines)
- **Line 38**: Change `og:image` from `https://lovable.dev/opengraph-image-p98pqg.png` to `/stackd-logo-new.png`
- **Line 42**: Change `twitter:image` from `https://lovable.dev/opengraph-image-p98pqg.png` to `/stackd-logo-new.png`

We'll use an absolute URL based on your published domain (`https://stackbnb-60920.lovable.app/stackd-logo-new.png`) so the image resolves correctly when shared on social platforms (relative paths don't work for OG tags).

## Technical Details

| File | Change |
|------|--------|
| `public/stackd-logo-new.png` | Copy of your branded logo for use as OG image |
| `index.html` (line 38) | `og:image` updated to `https://stackbnb-60920.lovable.app/stackd-logo-new.png` |
| `index.html` (line 42) | `twitter:image` updated to `https://stackbnb-60920.lovable.app/stackd-logo-new.png` |

### Note on Image Size
Social platforms recommend OG images be **1200x630 pixels**. Your current logo may appear small or oddly cropped in previews. If you have (or want to create) a proper banner-sized image, we can use that instead.

