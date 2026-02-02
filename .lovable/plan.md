

# Plan: App Store & Google Play Store Submission Readiness

## Overview

This plan prepares your Stackd app for submission to both the Apple App Store and Google Play Store using Capacitor to wrap the React web app as a native mobile application.

## Current Status Assessment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Core app functionality | Ready | Full booking, AI trip planning, vendor/host features |
| User authentication | Ready | Supabase auth with email/OAuth |
| Mobile-responsive UI | Ready | AppView provides mobile-first experience |
| Your splash screen | Ready | You have this already |
| App icons (all sizes) | Missing | Need 1024x1024 source to generate all sizes |
| Privacy Policy page | Missing | Footer links to `#` (line 148) |
| Terms of Service page | Missing | Footer links to `#` (line 151) |
| Capacitor native setup | Missing | No Capacitor packages installed |
| Test routes cleanup | Needed | `/test-instagram` and `/test-cancellation-email` exposed |
| OpenGraph images | Placeholder | Using default Lovable image |

---

## Phase 1: Legal Pages (Required for Both Stores)

Both Apple and Google require functional Privacy Policy and Terms of Service pages for app approval.

### 1.1 Create Privacy Policy Page

**File:** `src/pages/PrivacyPolicy.tsx`

Content sections:
- Last updated date
- Information we collect (name, email, phone, location, booking history, payment info via Stripe)
- How we use your information (processing bookings, communication, service improvement)
- Third-party services (Stripe payments, Supabase backend, Mapbox)
- Data retention and security
- Your rights (access, correction, deletion requests)
- Children's privacy (not intended for under 13)
- Contact information (hello@stackd.app, San Diego, CA)
- Changes to this policy

### 1.2 Create Terms of Service Page

**File:** `src/pages/TermsOfService.tsx`

Content sections:
- Acceptance of terms
- Description of service (connecting guests with hosts and vendors)
- User accounts and responsibilities
- Host and vendor obligations
- Booking and payment terms (Stripe processing, refunds)
- Prohibited activities
- Intellectual property rights
- Disclaimer of warranties
- Limitation of liability
- Dispute resolution
- Termination
- Governing law (California, USA)
- Contact information

### 1.3 Update Footer Links

**File:** `src/components/ui/footer-section.tsx`

Change lines 147-156:
- `Link to="#"` for Privacy Policy becomes `Link to="/privacy"`
- `Link to="#"` for Terms of Service becomes `Link to="/terms"`
- `Link to="#"` for Cookie Settings becomes `Link to="/privacy#cookies"`

### 1.4 Add Routes

**File:** `src/App.tsx`

Add imports and routes for:
- `/privacy` - PrivacyPolicy component
- `/terms` - TermsOfService component

---

## Phase 2: Clean Up Test Routes

Test routes should be renamed/protected before app store submission.

### 2.1 Rename Test Routes

| Current Route | New Route | Purpose |
|---------------|-----------|---------|
| `/test-instagram` | `/vendor/upload-photos` | Vendor photo upload flow |
| `/test-cancellation-email` | Remove or protect | Admin-only testing |

### 2.2 Update Auth.tsx Redirect

**File:** `src/pages/Auth.tsx` (line 67)

Change:
```typescript
navigate("/test-instagram", { replace: true });
```
To:
```typescript
navigate("/vendor/upload-photos", { replace: true });
```

### 2.3 Protect Admin Test Routes

Either:
- Remove `/test-cancellation-email` route entirely, OR
- Add admin authentication check to protect it

---

## Phase 3: App Icons

You'll need your app icon in multiple sizes for both platforms.

### Required Icon Sizes

**iOS (App Store):**
- 1024x1024 (App Store listing)
- 180x180 (iPhone @3x)
- 167x167 (iPad Pro)
- 152x152 (iPad @2x)
- 120x120 (iPhone @2x, Spotlight @3x)
- 87x87 (Settings @3x)
- 80x80 (Spotlight @2x)
- 76x76 (iPad @1x)
- 60x60 (iPhone @1x)
- 58x58 (Settings @2x)
- 40x40 (Spotlight @1x, Notification @2x)
- 29x29 (Settings @1x)
- 20x20 (Notification @1x)

**Android (Play Store):**
- 512x512 (Play Store listing)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)
- 36x36 (ldpi)

### 3.1 Create Icons Directory

**Location:** `public/icons/`

Structure:
```
public/icons/
├── icon-1024.png    (source for iOS)
├── icon-512.png     (Play Store)
├── icon-192.png     (Android xxxhdpi, PWA)
├── icon-180.png     (iOS iPhone)
├── icon-152.png     (iOS iPad)
├── icon-144.png     (Android xxhdpi)
├── icon-120.png     (iOS iPhone @2x)
├── icon-96.png      (Android xhdpi)
├── icon-72.png      (Android hdpi)
└── icon-48.png      (Android mdpi)
```

### 3.2 Update index.html

Add Apple touch icons and favicon references:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png">
```

---

## Phase 4: Splash Screen Configuration

Since you already have splash screens, they'll be configured in native projects.

### iOS Splash Screen

After Capacitor setup, place in:
```
ios/App/App/Assets.xcassets/Splash.imageset/
```

Requires:
- 1x, 2x, 3x versions for different device densities
- Or configure via LaunchScreen.storyboard

### Android Splash Screen

After Capacitor setup, place in:
```
android/app/src/main/res/
├── drawable-mdpi/splash.png
├── drawable-hdpi/splash.png
├── drawable-xhdpi/splash.png
├── drawable-xxhdpi/splash.png
└── drawable-xxxhdpi/splash.png
```

### 4.1 Install Splash Screen Plugin

Add `@capacitor/splash-screen` to dependencies for native splash control.

---

## Phase 5: Capacitor Native Setup

### 5.1 Install Capacitor Dependencies

**File:** `package.json`

Add to dependencies:
```json
{
  "@capacitor/core": "^6.0.0",
  "@capacitor/ios": "^6.0.0",
  "@capacitor/android": "^6.0.0",
  "@capacitor/splash-screen": "^6.0.0"
}
```

Add to devDependencies:
```json
{
  "@capacitor/cli": "^6.0.0"
}
```

### 5.2 Create Capacitor Configuration

**File:** `capacitor.config.ts` (create new)

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a235ef69dff14c2a8ad50b9dc979a550',
  appName: 'Stackd',
  webDir: 'dist',
  server: {
    url: 'https://a235ef69-dff1-4c2a-8ad5-0b9dc979a550.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;
```

### 5.3 Add Package Scripts

**File:** `package.json`

Add scripts:
```json
{
  "scripts": {
    "cap:sync": "npx cap sync",
    "cap:ios": "npx cap run ios",
    "cap:android": "npx cap run android",
    "cap:build": "npm run build && npx cap sync"
  }
}
```

---

## Phase 6: Update Metadata

### 6.1 Update OpenGraph Images

**File:** `index.html`

Replace placeholder Lovable images with your branded images:
```html
<meta property="og:image" content="https://stackbnb-60920.lovable.app/icons/og-image.png" />
<meta name="twitter:image" content="https://stackbnb-60920.lovable.app/icons/og-image.png" />
```

### 6.2 Add iOS/Android Meta Tags

**File:** `index.html`

Add mobile-specific meta tags:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Stackd">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#000000">
```

---

## Implementation Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/PrivacyPolicy.tsx` | Privacy policy page |
| `src/pages/TermsOfService.tsx` | Terms of service page |
| `capacitor.config.ts` | Capacitor configuration |
| `public/icons/` folder | App icons (requires your source image) |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add legal routes, rename test routes |
| `src/components/ui/footer-section.tsx` | Link to real legal pages |
| `src/pages/Auth.tsx` | Update vendor redirect path |
| `package.json` | Add Capacitor dependencies and scripts |
| `index.html` | Add mobile meta tags, update OG images |

---

## Post-Implementation Steps (Manual - Outside Lovable)

After I implement the code changes, you'll need to:

1. **Export to GitHub**
   - Click "Export to GitHub" in Lovable settings

2. **Clone and Setup Locally**
   ```bash
   git clone <your-repo>
   cd <project>
   npm install
   ```

3. **Add Native Platforms**
   ```bash
   npx cap add ios
   npx cap add android
   ```

4. **Copy Your Splash Screen**
   - Place your splash screen images in the native asset folders

5. **Generate App Icons**
   - Use a tool like [appicon.co](https://appicon.co) or Figma to generate all sizes from your 1024x1024 source
   - Copy to native asset folders

6. **Build and Sync**
   ```bash
   npm run build
   npx cap sync
   ```

7. **Open in IDE**
   ```bash
   npx cap open ios     # Requires Mac + Xcode
   npx cap open android # Requires Android Studio
   ```

8. **Test on Device/Simulator**

9. **Prepare Store Listings**
   - App Store: Screenshots, description, keywords, age rating
   - Play Store: Screenshots, description, content rating questionnaire

10. **Submit for Review**

---

## App Store Requirements Checklist

### Apple App Store
- [ ] 1024x1024 app icon
- [ ] iPhone screenshots (6.5" display)
- [ ] iPad screenshots (12.9" display) - if supporting iPad
- [ ] Privacy policy URL (will be `/privacy`)
- [ ] Support URL
- [ ] App description (up to 4000 characters)
- [ ] Keywords (up to 100 characters)
- [ ] Age rating responses
- [ ] App category selection

### Google Play Store
- [ ] 512x512 app icon
- [ ] Feature graphic (1024x500)
- [ ] Phone screenshots
- [ ] Tablet screenshots (if supporting)
- [ ] Privacy policy URL
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)
- [ ] Content rating questionnaire
- [ ] App category selection

