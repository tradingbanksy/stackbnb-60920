## Expand Tulum Restaurant Directory (4-5 Star Only)

### Current State

- 8 restaurants in `mockRestaurants.ts`, all rated 4.5-4.9 stars
- Each uses a unique imported photo

### Plan

Add 15-20 more highly-rated (4.0-5.0 star) Tulum restaurants to the mock data, bringing the total to ~25. These will be real, well-known Tulum restaurants.

### New Restaurants to Add (all 4.0+ stars)

1. **Gitano** - Mexican/Cocktails, 4.5 stars, $$$, Beach Zone
2. **Mezzanine** - Thai/Mexican fusion, 4.6 stars, $$$, Beach Zone
3. **Ziggy Beach** - Mediterranean, 4.4 stars, $$$, Beach Zone
4. **Casa Jaguar** - Mexican, 4.5 stars, $$$$, Beach Zone
5. **Noma Tulum** - Japanese/Mexican, 4.7 stars, $$$$, Beach Zone
6. **Rosa del Viento** - Mediterranean, 4.3 stars, $$$, Beach Zone
7. **Cenzontle** - Mexican, 4.6 stars, $$$, Centro
8. **Co.ConAmor** - Healthy/Vegan, 4.5 stars, $$, Centro
9. **La Zebra** - Mexican, 4.4 stars, $$$, Beach Zone
10. **Taboo** - Mediterranean/Mexican, 4.3 stars, $$$$, Beach Zone
11. **Tseen Ja** - Asian Fusion, 4.5 stars, $$$, Beach Zone
12. **El Asadero** - Mexican BBQ, 4.4 stars, $$, Centro
13. **La Nave Pizzeria** - Italian/Pizza, 4.6 stars, $$, Centro
14. **Matcha Mama** - Healthy/Smoothies, 4.7 stars, $$, Beach Zone
15. **Trattoria Romana** - Italian, 4.3 stars, $$$, Centro

### Photo Strategy

Since we don't have unique photos for each new restaurant, you will look on google to pull a few real images.

### Technical Changes

**File: `src/data/mockRestaurants.ts**`

- Import additional stock photos from `src/assets/restaurants/`
- Add 15 new restaurant entries with realistic data (names, addresses, coordinates, hours, descriptions, cuisine types)
- All rated between 4.0 and 5.0 stars

No other files need to change -- `AllRestaurants.tsx` already renders all entries from `mockRestaurants`.