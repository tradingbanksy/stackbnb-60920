

## Fix: Always Show "Where You'll Be" Map Section

### Problem

The "Where you'll be" section is currently hidden because it only renders when a vendor has a `google_place_id` set. The vendor you're viewing ("Araucaria Massage Tulum") -- and likely many others -- don't have that field filled in. However, the map component already supports looking up locations by vendor name alone, so the section should always appear.

### What Changes

Both the public profile page and vendor preview page will be updated to always show the "Where you'll be" map section, using the vendor's name to locate them when a Google Place ID isn't available.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/vendor/PublicProfile.tsx` | Remove the `google_place_id` guard -- always show the "Where you'll be" section. Pass `vendorName` as the primary lookup. |
| `src/pages/vendor/ProfilePreview.tsx` | Same change -- remove the `google_place_id` guard so the map always appears for vendors. |

### Technical Details

- The `VendorLocationMap` component already accepts `vendorName`, `vendorAddress`, and `placeId` as optional props
- The backend function (`vendor-directions`) already handles lookups by name when no Place ID is provided -- it searches Google Places API using the vendor name + "Tulum Mexico"
- The conditional will change from `{profile.google_place_id && (...)}` to always rendering the section, passing the vendor name and optionally the `google_place_id` if it exists
- No database changes needed

