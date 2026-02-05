

# Plan: Match Restaurant Image Gallery Size to Vendor Profile Style

## Current Difference

| Aspect | Restaurant (Arca) | Vendor (Araucaria) |
|--------|-------------------|-------------------|
| Container max-width | 450px | 375px |
| Gallery wrapper | `<div className="relative">` | `<div className="mb-4">` inside 375px container |
| Visual result | Larger, wider gallery | Compact, mobile-friendly gallery |

## Solution

Update `RestaurantDetail.tsx` to match the vendor profile's image gallery sizing and container constraints.

## Changes

### 1. Constrain the Interactive Selector Container

Wrap the `InteractiveSelector` in the restaurant detail page within a container that matches the vendor profile's styling:

```text
Before (RestaurantDetail.tsx):
├── <div className="relative">
│   ├── Action buttons (share/favorite)
│   └── <InteractiveSelector ... />

After:
├── <div className="max-w-[375px] mx-auto mb-4">
│   ├── <div className="relative">
│   │   └── Action buttons (share/favorite)
│   └── <InteractiveSelector ... />
```

### 2. Update Header Max-Width to Match

For visual consistency, also update the header's `max-w-[450px]` to `max-w-[375px]` to match the vendor profile's narrower, mobile-first design.

## File to Modify

| File | Changes |
|------|---------|
| `src/pages/guest/RestaurantDetail.tsx` | Update container widths to match vendor profile styling |

## Result

After this change, restaurant images (like Arca's photos) will display at the same compact, mobile-friendly size as vendor images (like Araucaria Massage Tulum).

