

# Plan: Make Restaurant & Experience Images Horizontally Scrollable

## Current Behavior

The `InteractiveSelector` component displays images in an **accordion-style layout** where:
- All images are visible as thin strips
- Clicking on an image expands it while collapsing others
- Users must click/tap each image to view it

## Proposed Solution

Replace the accordion-style `InteractiveSelector` with a **horizontal swipeable image carousel** that allows users to scroll left/right through images naturally on mobile.

## Implementation

### Create New Component: `ImageCarousel`

A new scrollable image gallery component with:
- **Horizontal scroll**: Touch-friendly swipe gestures on mobile
- **Snap scrolling**: Images snap into place for a polished feel
- **Dot indicators**: Shows current position in the gallery
- **Full-screen tap**: Tap an image to view it full-screen
- **Aspect ratio**: 4:3 ratio to match current design

### Update Restaurant Detail Page

Replace `InteractiveSelector` with the new `ImageCarousel` component in `RestaurantDetail.tsx`.

### Update Experience Detail Page

Replace `InteractiveSelector` with the new `ImageCarousel` component in `ExperienceDetailsPage.tsx`.

## Files to Modify

| File | Changes |
|------|---------|
| New: `src/components/ImageCarousel.tsx` | Create horizontal scrollable image gallery |
| `src/pages/guest/RestaurantDetail.tsx` | Replace InteractiveSelector with ImageCarousel |
| `src/pages/guest/ExperienceDetailsPage.tsx` | Replace InteractiveSelector with ImageCarousel |

## Technical Details

The new `ImageCarousel` component will use:
- **CSS scroll-snap** for native scrolling with snap points
- **overflow-x-scroll** for horizontal scrolling
- **Intersection Observer** to track current visible image for the dot indicators
- Optional full-screen modal when tapping an image

```text
+------------------------------------------+
|  [Image 1] → [Image 2] → [Image 3] →     |  ← Swipe left/right
+------------------------------------------+
            ●  ○  ○  ○                        ← Dot indicators
```

### Component Props

```typescript
interface ImageCarouselProps {
  images: string[];
  alt?: string;
  aspectRatio?: "4/3" | "16/9" | "1/1";
  showFullScreenOnTap?: boolean;
}
```

## User Experience Improvements

| Before | After |
|--------|-------|
| Must click each image strip | Swipe left/right naturally |
| All images visible at once as strips | One large image at a time |
| Desktop-focused interaction | Mobile-first touch gestures |
| Accordion animation | Smooth scroll-snap |

## Summary

This change will create a more intuitive, mobile-friendly image browsing experience for both restaurant and experience detail pages. Users will be able to swipe through images naturally instead of clicking on each one individually.

