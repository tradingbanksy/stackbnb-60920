# Vendor Profile Guidelines

Use this document as a reference when creating or editing vendor profiles in stackd.

---

## 1. Image Display Rules

### Profile Page (VendorPublicProfile)
- **Limit photos to 3** for the InteractiveSelector component to match experience pages
- Photos should use `object-cover` for proper cropping
- The InteractiveSelector dimensions are fixed at `max-w-[450px] h-[280px]`
- Photo titles follow the pattern: "Featured", "In Action", "View 3"

### Card Thumbnails (AppView, Wishlists)
- Use `aspect-square` container with `w-36` width
- Images must use `object-cover` to fill uniformly
- If no photos exist, show gradient placeholder with Store icon

---

## 2. Booking Flow

- Vendor booking uses the same form pattern as experiences
- Route: `/vendor/:id/book` → `/vendor/:id/payment` → `/vendor/:id/confirmed`
- Book Now button navigates to `/vendor/:id/book`
- Booking form collects: date, time, guests, special requests

---

## 3. Favorites System

### Storing Favorites
- Vendor favorites are stored in `localStorage` under key `vendorFavorites`
- Format: `string[]` (array of vendor profile IDs)

### Displaying Favorites
- Heart icon on vendor cards toggles favorite state
- Favorited vendors appear in `/wishlists` under the **"Services"** tab
- The Services tab fetches vendor details from Supabase using the stored IDs

### Heart Icon States
- **Not favorited**: `fill-black/40 text-white` with drop shadow
- **Favorited**: `fill-red-500 text-red-500`

---

## 4. Vendor Profile Structure

### Required Fields
- `name`: Vendor business name
- `category`: e.g., "Private Chef", "Massage & Spa", "Photography"
- `listing_type`: `'experience'` or `'restaurant'`
- `is_published`: Must be `true` to appear publicly

### Optional Fields
- `description`: Brief overview
- `about_experience`: Detailed experience description
- `photos`: Array of image URLs (first 3 displayed in selector)
- `price_per_person`: Number
- `duration`: e.g., "3 hours"
- `max_guests`: Number
- `included_items`: Array of strings
- `google_rating`: Number (1-5)
- `instagram_url`: Full URL
- `menu_url`: Full URL
- `google_reviews_url`: Full URL

---

## 5. Category Icons

| Category | Emoji | Display Location |
|----------|-------|------------------|
| Private Chef | 👨‍🍳 | Profile header |
| Massage & Spa | 💆 | Profile header |
| Yacht Charter | 🛥️ | Profile header |
| Photography | 📸 | Profile header |
| Tour Guide | 🗺️ | Profile header |
| Fitness & Yoga | 🧘 | Profile header |
| Wine Tasting | 🍷 | Profile header |
| Fishing Charter | 🎣 | Profile header |
| Water Sports | 🌊 | Profile header |
| Cooking Class | 👩‍🍳 | Profile header |
| Transportation | 🚗 | Profile header |

---

## 6. Where Vendors Appear

1. **AppView Explore Tab**
   - `listing_type: 'restaurant'` → "Restaurants Near You" section
   - `listing_type: 'experience'` → "Popular Experiences" section

2. **Wishlists Page**
   - Services tab shows all favorited vendors

3. **Direct Link**
   - `/vendor/:id` shows the full vendor profile

---

## 7. Quick Checklist for New Vendors

- [ ] Photos uploaded (at least 1, ideally 3)
- [ ] `is_published` set to `true`
- [ ] `listing_type` correctly set
- [ ] `category` matches one of the predefined categories
- [ ] `price_per_person` set if applicable
- [ ] Heart/favorite button tested and working
- [ ] Appears correctly in AppView
- [ ] Profile page displays uniformly with experiences
