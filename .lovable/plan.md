

## Add "Where You'll Meet" and "Meet the Vendor" Sections

### Overview

Two new Airbnb-inspired sections will be added to all vendor profile pages:

1. **"Where you'll be"** -- A map section showing the meeting point/venue location, styled like Airbnb's location section with a static map preview and location description
2. **"Meet your host"** -- A section with the vendor's photo, name, bio, and key highlights (like Airbnb's "Meet your Host" card), editable by the vendor in their Create/Update Profile form

### Database Changes

Two new columns need to be added to the `vendor_profiles` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `host_bio` | `text` | `NULL` | Vendor's personal bio / "About me" text shown in the "Meet your host" section |
| `host_avatar_url` | `text` | `NULL` | URL to the vendor's personal profile photo (not business photos) |
| `meeting_point_description` | `text` | `NULL` | Human-readable meeting point description (e.g. "We'll meet at the cenote entrance near the parking lot") |

The `vendor_profiles_public` view also needs to be updated to expose these new columns to unauthenticated guests.

### Section Designs

#### "Where you'll be" Section

This section appears after "What's included" and before reviews. It uses the existing `VendorLocationMap` component (which already fetches location data via `google_place_id` and Mapbox) but wraps it in the Airbnb section style:

- Section header: "Where you'll be" (`text-[22px] font-semibold`)
- Map display using the existing `VendorLocationMap` component
- Below the map: the `meeting_point_description` text if provided (e.g., "We'll meet at the beach club entrance")
- City name displayed as a subtitle
- Separated by `<Separator />` dividers like all other sections

#### "Meet your host" Section

Styled like Airbnb's host card:

```
+----------------------------------+
|  [Avatar]  Vendor Name           |
|             Category             |
|                                  |
|  "Bio text goes here..."        |
|                                  |
|  [Contact Host button]           |
+----------------------------------+
```

- Circular avatar image (from `host_avatar_url`, or initials fallback)
- Vendor name in bold, category as subtitle
- Bio text from `host_bio` with "Read more" truncation
- Google rating displayed inline if available
- Optional "Contact Host" or "Message" button

### Files to Create / Modify

#### New Component
- **`src/components/MeetTheHost.tsx`** -- Reusable component that displays the vendor's avatar, name, category, bio, and rating in the Airbnb "Meet your Host" card style

#### Modified Files

| File | Changes |
|------|---------|
| `src/pages/vendor/PublicProfile.tsx` | Add "Where you'll be" section with `VendorLocationMap`, add "Meet your host" section with new `MeetTheHost` component. Update `VendorProfile` interface to include new fields. |
| `src/pages/vendor/ProfilePreview.tsx` | Add both new sections to the vendor preview page (matching the public profile layout). Update `VendorProfile` interface. |
| `src/pages/vendor/CreateProfile.tsx` | Add new form fields: "Meeting Point Description" textarea, "About You" bio textarea, and avatar photo upload. Add these fields to the form schema, existing profile loading, and form submission. |
| `src/pages/guest/ExperienceDetailsPage.tsx` | Add a "Where you'll be" section (can show a placeholder since mock data doesn't have real locations) |

#### Database Migration
- Add `host_bio`, `host_avatar_url`, and `meeting_point_description` columns to `vendor_profiles`
- Recreate the `vendor_profiles_public` view to include these new columns

### Implementation Sequence

1. **Database migration**: Add three new columns and update the public view
2. **Create `MeetTheHost` component**: Build the Airbnb-style host card
3. **Update `CreateProfile.tsx`**: Add form fields for bio, avatar upload, and meeting point description
4. **Update `PublicProfile.tsx`**: Add both new sections between "What's included" and reviews
5. **Update `ProfilePreview.tsx`**: Mirror the same sections for the vendor's preview
6. **Update `ExperienceDetailsPage.tsx`**: Add location section for consistency

### Technical Details

- Avatar uploads will use the existing `vendor-photos` storage bucket with a path pattern of `{user_id}/avatar-{timestamp}.{ext}`
- The `VendorLocationMap` component is already built and functional -- it uses `google_place_id` to look up locations via the `vendor-directions` edge function and renders a Mapbox map with route animation
- The "Meet your host" component will use Tailwind's `line-clamp` for bio truncation with a "Read more" toggle (same pattern as the "About this experience" section)
- All new sections use the same Airbnb design language: no Card wrappers, `<Separator />` dividers, consistent `text-[22px]` headers, `text-[15px]` body text
- The `meeting_point_description` field gives vendors a way to provide specific instructions like "We'll meet you at the hotel lobby" or "Look for the blue van at the marina entrance"

