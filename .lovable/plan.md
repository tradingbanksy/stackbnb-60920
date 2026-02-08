

## Populate Google Place IDs for All Vendors

### What's Happening

Currently only 1 out of 9 vendors (IK Snorkeling) has a `google_place_id` set. The other 8 vendors are missing it, which means the Google Reviews preview section won't appear on their profiles. We need to update each vendor's database record with the correct Google Place ID so the reviews section shows up automatically.

### Vendors to Update

| Vendor | Google Business Match | Rating |
|--------|----------------------|--------|
| Araucaria Massage Tulum | Araucaria Massage Tulum | 5.0 |
| Bautista Chef | Private Chef Tulum by Turismo Mexico | 5.0 |
| Moov Adventure | Moving (transportation/rental in Tulum) | 4.8 |
| Paddle to the Sun | Extreme Control Adventures Tulum (paddleboarding/kitesurfing) | 4.7 |
| Tavi Castro Breathwork | Freedive Utopia (cenotes and reef) | 5.0 |
| Taco Tour | Tulum Taco Tour | 5.0 |
| Mexico Handmade | Tulum Craft Center | 4.2 |
| Unveil Sacred Mayan Cenotes | Cenote Calavera | 4.1 |

IK Snorkeling already has its Place ID set -- no change needed.

### Technical Change

A single database migration will update the `google_place_id` column for all 8 vendors. No code changes are needed -- the `GoogleReviewsPreview` component already renders automatically when `google_place_id` is present.

### What You'll See

After this update, every vendor profile page will show a "Google Reviews" section with:
- Aggregate star rating and review count
- Up to 5 horizontally scrollable review cards
- A "View all on Google" link

