# Vendor Profile Guidelines

Use this document as a reference when creating or editing vendor profiles in stackd.

---

## 1. Vendor Onboarding Flow

### New Vendor Signup
1. Vendor signs up via `/auth` with role "vendor"
2. Redirected to `/test-instagram` to scrape photos from Instagram
3. Navigates to `/vendor/create-profile` to complete profile
4. Once saved, redirected to `/vendor/preview` to see how guests view their profile

### Returning Vendor Login
1. Vendor logs in via `/auth`
2. System checks if `vendor_profiles` exists for user
3. **If profile exists** → Redirect to `/vendor/dashboard`
4. **If no profile** → Redirect to `/test-instagram` to create one

### Profile Create vs Update
- `/vendor/create-profile` automatically detects existing profile
- **New vendor**: Title shows "Create Vendor Profile", button says "Create Profile"
- **Existing vendor**: Title shows "Update Vendor Profile", button says "Update Profile"
- All existing data is pre-populated in the form

---

## 2. Vendor Preview Page (`/vendor/preview`)

The preview page shows vendors exactly how guests see their profile, plus management tools.

### Layout (matches VendorPublicProfile)
- Sticky header with category name and back button
- InteractiveSelector with up to 3 photos
- Category emoji + business name
- Quick info card (duration, max guests, price)
- Affiliate commission card (amber highlight, vendor-only view)
- About This Experience section
- What's Included list
- Social/menu links
- Photo gallery management

### Vendor-Only Controls
- **Preview banner** at top: "Preview - How Guests See You" with Draft/Live badge
- **Add photos button** in header
- **Photo management section** with delete buttons
- **Fixed bottom bar** with "Edit Profile" and "Publish/Unpublish" buttons

---

## 3. Image Display Rules

### Profile Page (VendorPublicProfile & VendorProfilePreview)
- **Limit photos to 3** for the InteractiveSelector component
- Photos use `object-cover` for proper cropping
- InteractiveSelector dimensions: `max-w-[450px] h-[280px]`
- Photo titles: "Featured", "In Action", "View 3"

### Card Thumbnails (AppView, Wishlists)
- Use `aspect-square` container with `w-36` width
- Images use `object-cover` to fill uniformly
- If no photos, show gradient placeholder with Store icon

---

## 4. Booking Flow

- Vendor booking uses the same form pattern as experiences
- Route: `/vendor/:id/book` → `/vendor/:id/payment` → `/vendor/:id/confirmed`
- Book Now button navigates to `/vendor/:id/book`
- Booking form collects: date, time, guests, special requests

---

## 5. Favorites System

### Storing Favorites
- Vendor favorites stored in `localStorage` key: `vendorFavorites`
- Format: `string[]` (array of vendor profile IDs)

### Displaying Favorites
- Heart icon on vendor cards toggles favorite state
- Favorited vendors appear in `/wishlists` under **"Services"** tab

### Heart Icon States
- **Not favorited**: `fill-black/40 text-white` with drop shadow
- **Favorited**: `fill-red-500 text-red-500`

---

## 6. Vendor Profile Database Schema

### Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `name` | text | Business name |
| `category` | text | e.g., "Private Chef", "Massage & Spa" |
| `listing_type` | text | `'experience'` or `'restaurant'` |
| `is_published` | boolean | Must be `true` to appear publicly |
| `user_id` | uuid | Owner's auth user ID |

### Optional Fields
| Field | Type | Description |
|-------|------|-------------|
| `description` | text | Brief tagline/summary |
| `about_experience` | text | Detailed description (AI-generated option) |
| `photos` | text[] | Array of image URLs (first 3 displayed) |
| `price_per_person` | numeric | Price in dollars |
| `duration` | text | e.g., "3 hours" |
| `max_guests` | integer | Maximum group size |
| `included_items` | text[] | Array of included items |
| `google_rating` | numeric | 1-5 star rating |
| `instagram_url` | text | Full Instagram profile URL |
| `menu_url` | text | Full menu/service list URL |
| `google_reviews_url` | text | Google reviews link |
| `commission_percentage` | numeric | Affiliate commission % (0-100) |

---

## 7. Affiliate Commission System

### Setting Commission
- Vendors set commission in "Affiliate Program" section of profile editor
- Field: `commission_percentage` (0-100)
- Example helper text: "If you set 15%, hosts earn $15 for every $100 booking"

### Visibility Rules
| Viewer Role | Can See Commission? |
|-------------|---------------------|
| Guest (user) | ❌ No |
| Host | ✅ Yes |
| Vendor | ✅ Yes |

### Display Locations
1. **Vendor Preview** (`/vendor/preview`)
   - Always visible to vendor owner
   - Amber-highlighted card showing percentage
   
2. **Public Profile** (`/vendor/:id`)
   - Only visible if viewer's role is "host" or "vendor"
   - Same amber card styling

3. **Host Dashboard** (`/host/dashboard`)
   - "Partner Commissions" section shows all vendors with commission programs
   - Sorted by highest commission first
   - Displays: photo, name, category, rating, commission %
   - Click navigates to vendor profile

---

## 8. Category Icons

| Category | Emoji |
|----------|-------|
| Private Chef | 👨‍🍳 |
| Massage & Spa | 💆 |
| Yacht Charter | 🛥️ |
| Photography | 📸 |
| Tour Guide | 🗺️ |
| Fitness & Yoga | 🧘 |
| Wine Tasting | 🍷 |
| Fishing Charter | 🎣 |
| Water Sports | 🌊 |
| Cooking Class | 👩‍🍳 |
| Transportation | 🚗 |
| default | ✨ |

---

## 9. Where Vendors Appear

1. **AppView Explore Tab** (`/appview`)
   - `listing_type: 'restaurant'` → "Restaurants Near You" section
   - `listing_type: 'experience'` → "Popular Experiences" section

2. **Host Dashboard** (`/host/dashboard`)
   - "Partner Commissions" section (if `commission_percentage` is set)

3. **Wishlists Page** (`/wishlists`)
   - Services tab shows all favorited vendors

4. **Direct Link**
   - `/vendor/:id` → Full public profile

---

## 10. Quick Checklist for New Vendors

### Profile Setup
- [ ] Photos uploaded (at least 1, ideally 3)
- [ ] `listing_type` correctly set (restaurant vs experience)
- [ ] `category` matches predefined list
- [ ] `price_per_person` set
- [ ] `duration` specified
- [ ] `max_guests` defined

### Affiliate Program (Optional)
- [ ] `commission_percentage` set (if offering affiliate program)

### Publishing
- [ ] Preview checked at `/vendor/preview`
- [ ] Profile published (is_published = true)
- [ ] Appears correctly in AppView under correct section
- [ ] Commission visible in Host Dashboard (if set)

### Testing
- [ ] Heart/favorite button works
- [ ] Book Now button navigates correctly
- [ ] All links (Instagram, Menu, Google Reviews) open properly
