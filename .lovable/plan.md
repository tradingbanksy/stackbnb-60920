

## Align Restaurant Card Sizes with Experience Cards in AppView

### Problem
The restaurant cards in `/appview` are visually misaligned with the experience cards -- there are visible gaps/spacing differences, and the cards don't appear to be the same size, even though both should be `w-36` squares.

### Root Cause
The curated restaurants use the `RestaurantCardWithGoogleRating` component, which is a separate component with its own Link/wrapper structure. Even though it uses the same `w-36 aspect-square` classes, subtle rendering differences (e.g., the `BlurImage` container div lacking explicit `w-full h-full` sizing) can cause the cards to appear differently sized or spaced compared to the experience cards, which are rendered inline.

### Solution
Render the curated restaurant cards using the **exact same inline markup** as the experience and vendor-restaurant cards in AppView. This eliminates any component-level rendering differences and guarantees pixel-perfect alignment.

The Google photo logic will be moved into a custom hook or handled at the data level, so the card markup stays identical between restaurants and experiences.

### Technical Details

**File: `src/pages/guest/AppView.tsx`**

Replace the `RestaurantCardWithGoogleRating` usage (lines 503-508) with inline markup that matches the experience cards exactly:

```tsx
{curatedRestaurants.map((restaurant, index) => {
  // Use Google-cached photo or fallback to static
  const cachedKey = `google_reviews_detail_${restaurant.id}`;
  let photo = restaurant.photos[0];
  try {
    const cached = localStorage.getItem(cachedKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.photos?.length > 0) photo = parsed.photos[0];
    }
  } catch {}

  return (
    <Link
      key={restaurant.id}
      to={`/restaurant/${restaurant.id}`}
      className="flex-shrink-0 w-36 animate-fade-in group"
      style={{ animationDelay: `${(vendorRestaurants.length + index) * 50}ms` }}
    >
      <div className="aspect-square rounded-xl overflow-hidden relative ...">
        <BlurImage
          src={photo}
          alt={restaurant.name}
          className="w-full h-full object-cover ..."
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium line-clamp-1">{restaurant.name}</p>
          <div className="flex items-center gap-1 text-white/80 text-[10px]">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span>{restaurant.rating?.toFixed(1) ?? 'N/A'}</span>
            <span>*</span>
            <span>{restaurant.priceRange}</span>
          </div>
        </div>
      </div>
    </Link>
  );
})}
```

This uses the exact same element structure, classes, and spacing as the vendor experience cards (lines 545-591) and vendor restaurant cards (lines 454-499), ensuring all cards are visually identical in size and alignment.

The `RestaurantCardWithGoogleRating` import can be removed if it's no longer used elsewhere in this file.

