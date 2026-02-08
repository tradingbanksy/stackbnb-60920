

## Redesign Vendor Public Profile to Match Airbnb Experience Pages

### Overview

A full visual redesign of the Vendor Public Profile page (`/vendor/:id`) to closely match Airbnb's experience detail page layout and styling. This covers the photo grid, content sections, typography, spacing, reviews, and bottom CTA -- not just the images.

### Reference Analysis (from your uploaded screenshots)

Key Airbnb patterns identified:
1. **Photo grid**: 2 photos on top (side by side), 1 wide photo on bottom, tight 2px gap, rounded corners
2. **Title area**: Large bold title, category as a subtle label, rating with review count inline
3. **Host/provider section**: Circular avatar, "Hosted by [Name]", short bio -- separated by a thin divider
4. **Description**: Clean text, no card wrapper, with "Read more" truncation for long descriptions
5. **What you'll do / What's included**: Simple list with icons, no card borders, clean spacing
6. **Reviews**: Horizontal scrollable review cards with avatar, name, date, and star rating
7. **Bottom CTA bar**: Price on the left, pink/gradient "Book" button on the right, fixed to bottom

### What Changes

---

#### 1. Stacked Photo Grid (replaces InteractiveSelector)

**New component**: `src/components/ui/stacked-photo-grid.tsx`

```text
+-------------------+-------------------+
|                   |                   |
|   Photo 1         |   Photo 2         |
|   (square-ish)    |   (square-ish)    |
|                   |                   |
+-------------------+-------------------+
|                                       |
|         Photo 3 (wide, shorter)       |
|                                       |
+---------------------------------------+
```

- 2px gap between photos
- Top row: two equal-width images, ~160px tall
- Bottom row: one full-width image, ~120px tall
- Rounded corners on the outer edges only (like Airbnb)
- "Show all photos" overlay button with grid icon (bottom-right of last photo)
- Handles 1, 2, or 3+ photos gracefully
- Full-screen photo viewer dialog when tapping photos or "Show all"

---

#### 2. Content Layout Overhaul (Airbnb-style sections)

Remove the heavy `Card` wrappers around every section. Airbnb uses flat, borderless sections separated by thin horizontal dividers (`<Separator />`).

**Section order** (matching Airbnb):

1. **Photo Grid** (full width, no padding)
2. **Title + Rating** -- bold title, category label, star rating with count
3. **Divider**
4. **Quick Info Row** -- duration and max guests as inline pills/icons (not in a card)
5. **Divider**
6. **About This Experience** -- plain text (no card), with "Read more" toggle if text is long (over 4 lines)
7. **Divider**
8. **What's Included** -- clean checklist, no card wrapper
9. **Divider**
10. **Price Tier Selector** (if applicable) -- kept but styled flatter
11. **Price Comparison** -- kept as-is (already well-designed)
12. **Divider**
13. **Guest Reviews** -- redesigned as horizontal scroll cards (Airbnb-style)
14. **Airbnb Reviews** (if any)
15. **Divider**
16. **External Links** -- Instagram, Menu, Google Reviews as a row
17. **Affiliate Commission** (host-only, conditional)
18. **Fixed Bottom CTA** -- price left, Book Now right

---

#### 3. Reviews Redesign

The current `VendorReviews` component uses vertical stacked cards. Airbnb uses horizontally scrolling review cards.

- Show aggregate rating with star count prominently
- Display review cards in a horizontal scrollable row
- Each card: rounded, fixed width (~260px), shows avatar initials, name, date, star rating, and truncated comment
- "Show all N reviews" link at the end

---

#### 4. Typography and Spacing

- Title: `text-2xl font-semibold` (Airbnb uses medium-weight, not ultra-bold)
- Section headers: `text-[22px] font-semibold` with generous top margin
- Body text: `text-[15px] leading-relaxed text-foreground` (not muted -- Airbnb uses dark text for descriptions)
- Dividers between sections: `border-t border-border` with `py-6` spacing on each section
- Remove Card shadows from content sections for a flatter, cleaner look

---

#### 5. Bottom CTA Bar

Keep the current fixed bottom bar but match Airbnb styling more closely:
- Left side: "From $XX" with price on a second line
- Right side: Rounded pink/gradient "Book" button
- Add subtle top shadow for depth

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/stacked-photo-grid.tsx` | New reusable photo grid component with 2+1 layout and full-screen viewer |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/vendor/PublicProfile.tsx` | Full layout restructure -- replace InteractiveSelector, remove Card wrappers, add dividers, reorder sections, update typography |

### Technical Details

- The `StackedPhotoGrid` component will use CSS Grid (`grid-cols-2` for top, `col-span-2` for bottom)
- Photos use `object-cover` for consistent aspect ratios
- Full-screen photo viewer uses Radix Dialog with swipe navigation
- "Read more" uses local state to toggle `line-clamp-4` on the description
- Horizontal review scroll uses `overflow-x-auto` with `snap-x` for smooth mobile scrolling
- No new dependencies required -- all built with existing Tailwind, Radix, and lucide-react
- Mobile-first, constrained to `max-w-[375px]`
- All existing functionality preserved: favorites, booking flow, host commission, price comparison, external links

