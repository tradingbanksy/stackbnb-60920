
# Plan: Reorganize Pages Directory Structure

## Overview

Reorganize the flat `src/pages/` directory (67 files) into logical subfolders based on user role and functionality. This improves code navigation, maintainability, and aligns the file structure with the app's three-sided marketplace architecture.

## Proposed Directory Structure

```text
src/pages/
├── admin/
│   ├── PlatformSettings.tsx
│   └── PromoCodes.tsx
├── auth/
│   ├── Auth.tsx
│   ├── ChangePassword.tsx
│   ├── ResetPassword.tsx
│   ├── RoleSelection.tsx
│   ├── SignIn.tsx
│   └── SignOut.tsx
├── guest/
│   ├── AllExperiences.tsx
│   ├── AllRestaurants.tsx
│   ├── AppView.tsx
│   ├── Booking.tsx
│   ├── BookingConfirmation.tsx
│   ├── BookingForm.tsx
│   ├── Confirmation.tsx
│   ├── ExperienceDetailsPage.tsx
│   ├── Explore.tsx
│   ├── GuestGuide.tsx
│   ├── Itinerary.tsx
│   ├── MyBookings.tsx
│   ├── PaymentPage.tsx
│   ├── PaymentSuccess.tsx
│   ├── Profile.tsx
│   ├── RestaurantDetail.tsx
│   ├── SharedItinerary.tsx
│   ├── Storefront.tsx
│   ├── TripItinerary.tsx
│   ├── TripPlannerChat.tsx
│   └── Wishlists.tsx
├── host/
│   ├── ActiveVendors.tsx
│   ├── AddVendor.tsx
│   ├── Auth.tsx
│   ├── Bookings.tsx
│   ├── Dashboard.tsx
│   ├── Earnings.tsx
│   ├── EditProfile.tsx
│   ├── PaymentSettings.tsx
│   ├── PayoutHistory.tsx
│   ├── Profile.tsx
│   ├── PropertyInfo.tsx
│   ├── Ratings.tsx
│   ├── Signup.tsx
│   ├── Storefront.tsx
│   ├── VendorManagement.tsx
│   └── Vendors.tsx
├── legal/
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   └── HelpSupport.tsx
├── marketing/
│   ├── ForHosts.tsx
│   ├── ForVendors.tsx
│   └── SplashPage.tsx
├── vendor/
│   ├── ActiveHosts.tsx
│   ├── AddService.tsx
│   ├── AllBookings.tsx
│   ├── BookingForm.tsx
│   ├── BusinessDetails.tsx
│   ├── CreateProfile.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── ProfilePreview.tsx
│   ├── PublicProfile.tsx
│   ├── Ratings.tsx
│   ├── RevenueBreakdown.tsx
│   ├── Settings.tsx
│   ├── Signup.tsx
│   └── UploadPhotos.tsx
└── NotFound.tsx
```

## Mapping of Files

| Current File | New Location |
|-------------|--------------|
| `ActiveHosts.tsx` | `vendor/ActiveHosts.tsx` |
| `AddService.tsx` | `vendor/AddService.tsx` |
| `AddVendor.tsx` | `host/AddVendor.tsx` |
| `AdminPromoCodes.tsx` | `admin/PromoCodes.tsx` |
| `AllBookings.tsx` | `vendor/AllBookings.tsx` |
| `AllExperiences.tsx` | `guest/AllExperiences.tsx` |
| `AllRestaurants.tsx` | `guest/AllRestaurants.tsx` |
| `AppView.tsx` | `guest/AppView.tsx` |
| `Auth.tsx` | `auth/Auth.tsx` |
| `Booking.tsx` | `guest/Booking.tsx` |
| `BookingConfirmation.tsx` | `guest/BookingConfirmation.tsx` |
| `BookingForm.tsx` | `guest/BookingForm.tsx` |
| `ChangePassword.tsx` | `auth/ChangePassword.tsx` |
| `Confirmation.tsx` | `guest/Confirmation.tsx` |
| `CreateVendorProfile.tsx` | `vendor/CreateProfile.tsx` |
| `EditHostProfile.tsx` | `host/EditProfile.tsx` |
| `ExperienceDetailsPage.tsx` | `guest/ExperienceDetailsPage.tsx` |
| `Explore.tsx` | `guest/Explore.tsx` |
| `ForHosts.tsx` | `marketing/ForHosts.tsx` |
| `ForVendors.tsx` | `marketing/ForVendors.tsx` |
| `GuestGuide.tsx` | `guest/GuestGuide.tsx` |
| `HelpSupport.tsx` | `legal/HelpSupport.tsx` |
| `HostActiveVendors.tsx` | `host/ActiveVendors.tsx` |
| `HostAuth.tsx` | `host/Auth.tsx` |
| `HostBookings.tsx` | `host/Bookings.tsx` |
| `HostDashboard.tsx` | `host/Dashboard.tsx` |
| `HostEarnings.tsx` | `host/Earnings.tsx` |
| `HostProfile.tsx` | `host/Profile.tsx` |
| `HostPropertyInfo.tsx` | `host/PropertyInfo.tsx` |
| `HostRatings.tsx` | `host/Ratings.tsx` |
| `HostSignup.tsx` | `host/Signup.tsx` |
| `HostStorefront.tsx` | `host/Storefront.tsx` |
| `HostVendorManagement.tsx` | `host/VendorManagement.tsx` |
| `HostVendors.tsx` | `host/Vendors.tsx` |
| `Itinerary.tsx` | `guest/Itinerary.tsx` |
| `MyBookings.tsx` | `guest/MyBookings.tsx` |
| `NotFound.tsx` | `NotFound.tsx` (stays at root) |
| `PaymentPage.tsx` | `guest/PaymentPage.tsx` |
| `PaymentSettings.tsx` | `host/PaymentSettings.tsx` |
| `PaymentSuccess.tsx` | `guest/PaymentSuccess.tsx` |
| `PayoutHistory.tsx` | `host/PayoutHistory.tsx` |
| `PlatformSettings.tsx` | `admin/PlatformSettings.tsx` |
| `PrivacyPolicy.tsx` | `legal/PrivacyPolicy.tsx` |
| `Profile.tsx` | `guest/Profile.tsx` |
| `ResetPassword.tsx` | `auth/ResetPassword.tsx` |
| `RestaurantDetail.tsx` | `guest/RestaurantDetail.tsx` |
| `RevenueBreakdown.tsx` | `vendor/RevenueBreakdown.tsx` |
| `RoleSelection.tsx` | `auth/RoleSelection.tsx` |
| `SharedItinerary.tsx` | `guest/SharedItinerary.tsx` |
| `SignIn.tsx` | `auth/SignIn.tsx` |
| `SignOut.tsx` | `auth/SignOut.tsx` |
| `SplashPage.tsx` | `marketing/SplashPage.tsx` |
| `Storefront.tsx` | `guest/Storefront.tsx` |
| `TermsOfService.tsx` | `legal/TermsOfService.tsx` |
| `TestInstagramScrape.tsx` | `vendor/UploadPhotos.tsx` |
| `TripItinerary.tsx` | `guest/TripItinerary.tsx` |
| `TripPlannerChat.tsx` | `guest/TripPlannerChat.tsx` |
| `VendorBookingForm.tsx` | `vendor/BookingForm.tsx` |
| `VendorBusinessDetails.tsx` | `vendor/BusinessDetails.tsx` |
| `VendorDashboard.tsx` | `vendor/Dashboard.tsx` |
| `VendorProfile.tsx` | `vendor/Profile.tsx` |
| `VendorProfilePreview.tsx` | `vendor/ProfilePreview.tsx` |
| `VendorPublicProfile.tsx` | `vendor/PublicProfile.tsx` |
| `VendorRatings.tsx` | `vendor/Ratings.tsx` |
| `VendorSettings.tsx` | `vendor/Settings.tsx` |
| `VendorSignup.tsx` | `vendor/Signup.tsx` |
| `Wishlists.tsx` | `guest/Wishlists.tsx` |

## Implementation Steps

### Step 1: Create Subdirectories
Create the 7 new subdirectories under `src/pages/`:
- `admin/`
- `auth/`
- `guest/`
- `host/`
- `legal/`
- `marketing/`
- `vendor/`

### Step 2: Move and Rename Files
Move each file to its new location according to the mapping above. Files with role prefixes (Host, Vendor) will have the prefix removed since the folder provides that context.

### Step 3: Create Index Files
Add `index.ts` barrel exports in each subdirectory for cleaner imports:

```typescript
// src/pages/host/index.ts
export { default as HostDashboard } from './Dashboard';
export { default as HostProfile } from './Profile';
// ... etc
```

### Step 4: Update App.tsx Imports
Update all 67+ imports in `App.tsx` to use the new paths:

```typescript
// Before
import HostDashboard from "./pages/HostDashboard";

// After  
import HostDashboard from "./pages/host/Dashboard";
// Or using barrel exports:
import { HostDashboard } from "./pages/host";
```

### Step 5: Update Any Cross-References
Search for any other files that import from pages and update those paths.

## Benefits

| Benefit | Description |
|---------|-------------|
| **Discoverability** | Developers can quickly find pages by role/feature |
| **Scalability** | Easy to add new pages within each category |
| **Consistency** | Mirrors the route structure (`/host/...`, `/vendor/...`) |
| **Reduced Clutter** | 67 files organized into 7 logical groups |
| **Team Collaboration** | Different team members can work on different sections |

## Files Changed

| Action | Count | Files |
|--------|-------|-------|
| Create | 7 | New subdirectories |
| Move | 66 | All page files except NotFound |
| Modify | 1 | `src/App.tsx` (update imports) |
| Create | 7 | Index barrel files for each subdirectory |

## Technical Notes

- Route paths remain unchanged (no breaking changes to URLs)
- Only the file organization changes
- Components keep their export names for consistency
- NotFound stays at root as it's a catch-all utility page
