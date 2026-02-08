

## Unify All Profile/Detail Pages to Match Airbnb Design Theme

### Overview

Three additional pages still use the old `InteractiveSelector` (expanding photo strips) and `Card`-wrapped content sections. These need to be updated to match the Airbnb-style design already implemented on `VendorPublicProfile.tsx`.

### Pages That Need Updating

| Page | Route | Current State |
|------|-------|--------------|
| **Vendor Profile Preview** (`src/pages/vendor/ProfilePreview.tsx`) | `/vendor/preview` | Uses `InteractiveSelector` + Card-wrapped sections |
| **Experience Details** (`src/pages/guest/ExperienceDetailsPage.tsx`) | `/experience/:id` | Uses `InteractiveSelector` + Card-wrapped sections |
| **Restaurant Detail** (`src/pages/guest/RestaurantDetail.tsx`) | `/restaurant/:id` | Uses `InteractiveSelector` + Card-wrapped sections |

The already-updated page (`VendorPublicProfile.tsx`) serves as the design reference.

---

### Design Consistency Checklist (applied to all pages)

Each page will be updated to follow these Airbnb-style patterns:

1. **Photo grid**: Replace `InteractiveSelector` with `StackedPhotoGrid` (2 photos on top, 1 wide on bottom, 2px gap, rounded corners, "Show all photos" button)
2. **Header bar**: Clean sticky header with back arrow (no border), share and favorite buttons on the right
3. **Title section**: `text-2xl font-semibold` title, category/cuisine as subtle text, inline star rating
4. **Section separators**: Thin `<Separator />` dividers between sections instead of Card wrappers
5. **Section spacing**: `py-6` padding on each section block
6. **Typography**: Section headers use `text-[22px] font-semibold`, body text uses `text-[15px] leading-relaxed text-foreground`
7. **Lists**: Clean checklist items with `CheckCircle` icons, no Card background
8. **Bottom CTA**: Price on the left ("From $XX"), action button on the right with rounded pink/gradient styling

---

### File-by-File Changes

#### 1. `src/pages/vendor/ProfilePreview.tsx` (Vendor's own preview)

This is the vendor's "how guests see you" preview. It needs the same visual treatment as the public profile, while keeping the vendor-specific features (photo upload/reorder, publish/submit buttons, verification banners).

- Replace `InteractiveSelector` import with `StackedPhotoGrid`
- Remove `Card` wrappers from Quick Info, Description, What's Included, Links, and Photo Gallery sections
- Add `<Separator />` dividers between sections
- Update typography to match: `text-[22px] font-semibold` for section headers, `text-[15px]` for body
- Keep vendor-only features intact: preview banner, verification status, photo upload, reorder, publish/submit buttons, commission display
- Update Quick Info to use the inline icon+text layout (instead of centered grid-cols-3 Card)
- Update bottom action bar styling to be consistent

#### 2. `src/pages/guest/ExperienceDetailsPage.tsx` (Mock data experiences)

This page uses hardcoded mock data for demo experiences. It needs the same Airbnb styling.

- Replace `InteractiveSelector` import with `StackedPhotoGrid`
- Remove `Card` wrappers from Quick Info, Description, and What's Included sections
- Add `<Separator />` dividers between sections
- Update header to match: clean sticky header with just back arrow (no border-b on the header bar, use `bg-background/95 backdrop-blur-sm`)
- Update typography to match
- Update Quick Info from centered grid-cols-3 Card to inline icon+text layout
- Update bottom CTA to match: price left, rounded pink/gradient "Book Now" button right

#### 3. `src/pages/guest/RestaurantDetail.tsx` (Restaurant detail page)

This page shows restaurant details with Google reviews. It needs the same treatment while keeping restaurant-specific features (hours, reservation, Google reviews).

- Replace `InteractiveSelector` import with `StackedPhotoGrid`
- Move share/favorite buttons into the header bar (same pattern as VendorPublicProfile)
- Update header to match: clean `bg-background/95 backdrop-blur-sm` without border
- Update typography and spacing to match
- Keep restaurant-specific content (hours, reservation buttons, Google reviews) but remove Card wrappers
- Add `<Separator />` dividers between sections

---

### What Stays the Same

- The `StackedPhotoGrid` component (`src/components/ui/stacked-photo-grid.tsx`) -- already built, reused across all pages
- The `VendorReviews` component -- already Airbnb-styled with horizontal scroll
- All business logic, data fetching, navigation, and functionality remains unchanged
- Only the visual presentation layer changes

### Files Modified

| File | Type of Change |
|------|---------------|
| `src/pages/vendor/ProfilePreview.tsx` | Replace InteractiveSelector with StackedPhotoGrid, remove Card wrappers, add Separators, update typography |
| `src/pages/guest/ExperienceDetailsPage.tsx` | Replace InteractiveSelector with StackedPhotoGrid, remove Card wrappers, add Separators, update typography and CTA |
| `src/pages/guest/RestaurantDetail.tsx` | Replace InteractiveSelector with StackedPhotoGrid, remove Card wrappers, add Separators, update header and typography |

### No New Files or Dependencies

All changes use existing components (`StackedPhotoGrid`, `Separator`) and existing Tailwind classes. No new packages needed.

