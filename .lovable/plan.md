

# Stackd App Review -- Issues, Gaps, and Improvement Opportunities

After inspecting the codebase, UI, routes, security, and data flow, here is a comprehensive breakdown.

---

## 1. Security Issues (Critical)

**Admin routes are unprotected.** `/admin/settings`, `/admin/promo-codes`, and `/admin/vendor-approvals` have no `ProtectedRoute` wrapper in `App.tsx`. Anyone can navigate directly to these pages. While the components do a client-side admin check via `useQuery`, the page still renders briefly and the check is purely client-side -- there's no route-level guard.

**Fix:** Wrap all admin routes in a `ProtectedAdminRoute` component that checks the `user_roles` table for `admin` role before rendering.

**`vendor/upload-photos` is completely unprotected.** Line 204 in `App.tsx`: `<Route path="/vendor/upload-photos" element={<TestInstagramScrape />} />` -- no auth guard at all. This is a test page exposed in production.

**Fix:** Either remove it or wrap it in `ProtectedVendorRoute`.

---

## 2. Data & Content Bugs

**"717:" artifact in vendor description.** Line 1005 of `AppView.tsx` contains `717:` as a literal string in the "For Vendors" description on the Services tab. This appears to be a line number artifact that leaked into the content.

**Fix:** Remove `717:` from the text.

**`vendor_profiles_public` doesn't include `city` column** (per the comment on line 198: "Filter by city client-side since the public view doesn't include city"). This means ALL published vendors from ALL cities show up regardless of the selected destination. If you expand to multiple cities, every city will show every vendor.

**Fix:** Add `city` to the public view, or filter server-side.

**`AllRestaurants` page still has Unsplash fallback image** (line 34): `'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'` -- this contradicts the "no stock images" goal.

**Fix:** Remove the Unsplash fallback, use a skeleton or Google-sourced photo instead.

---

## 3. UX / Product Issues

**Search button does nothing.** The orange search icon button (line 451 in AppView) has no `onClick` handler -- it's purely decorative. Users will tap it expecting something to happen.

**Fix:** Either wire it to filter/navigate, or remove it.

**Wishlists use `localStorage` only.** Favorites (`favorites` and `vendorFavorites`) are stored in localStorage, not the database. If a user logs in on another device, their wishlists are gone. There IS a `wishlists` + `wishlist_items` table in the database that appears unused on the main AppView.

**Fix:** Sync favorites to the database for authenticated users.

**"How stackd Works" and pricing sections are on the Explore tab** -- these are marketing/host-focused content mixed into the consumer browsing experience. A guest looking for restaurants doesn't need to see commission breakdowns. This content is also duplicated on the Services tab.

**Fix:** Move host/vendor marketing content exclusively to the Services tab. Keep Explore focused on discovery.

**Duplicated content across Explore and Services tabs.** "Partner With Us", "Common Questions", and "How stackd Works" sections appear on BOTH tabs with nearly identical content. This adds unnecessary scroll length and feels redundant.

**The date picker in the search bar has no effect.** `selectedDate` is set but never used to filter any content. Users pick a date but nothing changes.

---

## 4. Performance Concerns

**Google Photos fetch fires for ALL curated restaurants on every page load** if not cached. With 8+ Tulum restaurants, that's 8+ parallel edge function calls on first visit. No debouncing or batching.

**Fix:** Consider a batch endpoint that fetches photos for multiple restaurants in a single call, or cache more aggressively (e.g., cache duration check).

**AppView.tsx is 1,275 lines.** This single component handles hero, restaurants, experiences, wishlists, marketing, FAQ, partner links, and the entire Services/About tabs. It's a maintenance burden.

**Fix:** Extract into smaller components: `ExploreTab`, `ServicesTab`, `AboutTab`, `HeroSection`, `RestaurantRow`, etc.

---

## 5. Missing Features / Polish

**No loading state on splash page.** The `/` splash page has no indication if auth is being checked -- users may tap "Sign Up" and get redirected if already logged in, with no visual feedback.

**No error boundary on individual routes.** The global `ErrorBoundary` catches everything but doesn't provide route-level recovery. A crash in one page takes down the entire app.

**No "pull to refresh" on AppView.** For a mobile-first app imitating Airbnb, there's no way to refresh content without reloading the page.

**Trip planner chat doesn't pass auth token.** The edge function has `verify_jwt = false` and the fetch call (line ~170 in `TripPlannerChatContext.tsx`) sends no `Authorization` header. This means anyone can spam the AI chat endpoint without being authenticated, which has cost implications.

---

## 6. Recommended Priority Order

1. **Protect admin routes** and remove/protect the test upload-photos route (security)
2. **Remove "717:" text artifact** (content bug, user-facing)
3. **Remove Unsplash fallback** in AllRestaurants (consistency)
4. **Wire search button** or remove it (UX)
5. **De-duplicate Explore/Services tab content** (UX)
6. **Add city filtering** to vendor_profiles_public view (data correctness)
7. **Add auth header to trip planner chat** (cost/security)
8. **Break up AppView.tsx** into smaller components (maintainability)
9. **Sync wishlists to database** (feature completeness)

