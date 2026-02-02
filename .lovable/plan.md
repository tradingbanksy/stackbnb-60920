

# Plan: Delete /home Page and Update Navigation

## Summary

Remove the `/home` page entirely since you work exclusively from `/appview`. The "Browser" link in AppView's bottom navigation will be updated to point elsewhere (or removed).

## Current State

| Reference | Location | Details |
|-----------|----------|---------|
| Route definition | `src/App.tsx` line 148 | `<Route path="/home" element={<Home />} />` |
| Import statement | `src/App.tsx` line 21 | `import Home from "./pages/Home"` |
| Bottom nav link | `src/pages/AppView.tsx` line 1172 | "Browser" button links to `/home` |
| Page file | `src/pages/Home.tsx` | 517-line component |

## Decision: What Should "Browser" Do?

The "Browser" button in AppView currently links to `/home` for users who want to see the desktop browser experience. 

**Options:**
1. **Remove the "Browser" button entirely** - Since you don't use /home
2. **Link to the splash page (`/`)** - Entry point of the app  
3. **Link to `/for-hosts` or `/for-vendors`** - The marketing/info pages

**Recommendation:** Remove the "Browser" button entirely, since the app is now mobile-first and the desktop view is deprecated for your workflow.

## Changes

### 1. Delete Home.tsx

Remove `src/pages/Home.tsx` entirely (517 lines).

### 2. Update App.tsx

- Remove the `import Home from "./pages/Home"` statement
- Remove the `<Route path="/home" element={<Home />} />` route

### 3. Update AppView.tsx Bottom Navigation

Remove the "Browser" nav item from the bottom navigation array:

```diff
  {[
    { to: "/wishlists", icon: Heart, label: "Wishlists", badge: favorites.length },
    { to: "/trip-planner", icon: Sparkles, label: "AI" },
    { to: profileRoute, icon: User, label: "Profile", roleBadge: role },
-   { to: "/home", icon: Monitor, label: "Browser" },
  ].map((item) => {
```

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/Home.tsx` | Delete |
| `src/App.tsx` | Remove import and route |
| `src/pages/AppView.tsx` | Remove "Browser" nav item |

## Impact

- Users navigating directly to `/home` will see the 404 Not Found page
- The bottom navigation in AppView will have 3 items instead of 4 (Wishlists, AI, Profile)
- Mobile-first experience is fully consolidated to AppView

