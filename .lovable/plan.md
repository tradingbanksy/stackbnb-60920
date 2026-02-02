

# Plan: Complete App Icons Setup for App Store Submission

## Overview

Copy all uploaded Stackd app icons to `public/icons/` and update `index.html` with comprehensive icon references for iOS App Store, Google Play Store, PWA, and browser support.

## New Icons in This Upload

| File | Purpose |
|------|---------|
| `appstore.png` | iOS App Store listing (1024x1024) |
| `playstore.png` | Google Play Store listing (512x512) |
| `ic_launcher.png` | Android launcher (largest) |
| `ic_launcher-2.png` | Android launcher (large) |
| `ic_launcher-3.png` | Android launcher (medium) |
| `ic_launcher-4.png` | Android launcher (small) |
| `ic_launcher-5.png` | Android launcher (medium-small) |

## Implementation Steps

### Step 1: Create public/icons/ Directory Structure

Copy all icons from previous uploads plus new uploads:

```text
public/icons/
├── appstore.png       ← iOS App Store (1024x1024)
├── playstore.png      ← Google Play Store (512x512)
├── ic_launcher.png    ← Android launcher variants
├── ic_launcher-2.png
├── ic_launcher-3.png
├── ic_launcher-4.png
├── ic_launcher-5.png
├── icon-1024.png      ← From previous uploads
├── icon-512.png
├── icon-258.png
├── icon-256.png
├── icon-234.png
├── icon-216.png
├── icon-196.png
├── icon-180.png       ← iOS iPhone @3x
├── icon-172.png
├── icon-167.png       ← iOS iPad Pro
├── icon-152.png       ← iOS iPad @2x
├── icon-144.png
├── icon-128.png
├── icon-120.png       ← iOS Spotlight
├── icon-114.png
├── icon-108.png
├── icon-102.png
├── icon-100.png
├── icon-92.png
├── icon-88.png
├── icon-87.png        ← iOS Settings @3x
├── icon-80.png
├── icon-76.png        ← iOS iPad @1x
├── icon-72.png
├── icon-66.png
├── icon-64.png
├── icon-60.png        ← iOS iPhone @1x
├── icon-58.png        ← iOS Settings @2x
├── icon-57.png
├── icon-55.png
├── icon-50.png
├── icon-48.png
├── icon-40.png
├── icon-32.png        ← Browser favicon
├── icon-29.png        ← iOS Settings @1x
├── icon-20.png        ← iOS Notification
├── icon-16.png        ← Browser favicon
└── Contents.json      ← Xcode asset catalog reference
```

### Step 2: Update index.html

Update the head section with comprehensive icon references:

```html
<!-- iOS App Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png">
<link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120.png">
<link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76.png">

<!-- Android/PWA Icons -->
<link rel="icon" type="image/png" sizes="196x196" href="/icons/icon-196.png">
<link rel="icon" type="image/png" sizes="128x128" href="/icons/icon-128.png">
<link rel="icon" type="image/png" sizes="72x72" href="/icons/icon-72.png">

<!-- Standard Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png">
```

## Files to Create

### Store Icons (This Upload)
| Destination | Source |
|-------------|--------|
| `public/icons/appstore.png` | `user-uploads://appstore.png` |
| `public/icons/playstore.png` | `user-uploads://playstore.png` |
| `public/icons/ic_launcher.png` | `user-uploads://ic_launcher.png` |
| `public/icons/ic_launcher-2.png` | `user-uploads://ic_launcher-2.png` |
| `public/icons/ic_launcher-3.png` | `user-uploads://ic_launcher-3.png` |
| `public/icons/ic_launcher-4.png` | `user-uploads://ic_launcher-4.png` |
| `public/icons/ic_launcher-5.png` | `user-uploads://ic_launcher-5.png` |

### iOS/Web Icons (Previous Uploads)
| Destination | Source |
|-------------|--------|
| `public/icons/icon-1024.png` | `user-uploads://1024.png` |
| `public/icons/icon-512.png` | `user-uploads://512.png` |
| `public/icons/icon-258.png` | `user-uploads://258.png` |
| `public/icons/icon-256.png` | `user-uploads://256.png` |
| `public/icons/icon-234.png` | `user-uploads://234.png` |
| `public/icons/icon-216.png` | `user-uploads://216.png` |
| `public/icons/icon-196.png` | `user-uploads://196.png` |
| `public/icons/icon-180.png` | `user-uploads://180.png` |
| `public/icons/icon-172.png` | `user-uploads://172.png` |
| `public/icons/icon-167.png` | `user-uploads://167.png` |
| `public/icons/icon-152.png` | `user-uploads://152.png` |
| `public/icons/icon-144.png` | `user-uploads://144.png` |
| `public/icons/icon-128.png` | `user-uploads://128.png` |
| `public/icons/icon-120.png` | `user-uploads://120.png` |
| `public/icons/icon-114.png` | `user-uploads://114.png` |
| `public/icons/icon-108.png` | `user-uploads://108.png` |
| `public/icons/icon-102.png` | `user-uploads://102.png` |
| `public/icons/icon-100.png` | `user-uploads://100.png` |
| `public/icons/icon-92.png` | `user-uploads://92.png` |
| `public/icons/icon-88.png` | `user-uploads://88.png` |
| `public/icons/icon-87.png` | `user-uploads://87.png` |
| `public/icons/icon-80.png` | `user-uploads://80.png` |
| `public/icons/icon-76.png` | `user-uploads://76.png` |
| `public/icons/icon-72.png` | `user-uploads://72.png` |
| `public/icons/icon-66.png` | `user-uploads://66.png` |
| `public/icons/icon-64.png` | `user-uploads://64.png` |
| `public/icons/icon-60.png` | `user-uploads://60.png` |
| `public/icons/icon-58.png` | `user-uploads://58.png` |
| `public/icons/icon-57.png` | `user-uploads://57.png` |
| `public/icons/icon-55.png` | `user-uploads://55.png` |
| `public/icons/icon-50.png` | `user-uploads://50.png` |
| `public/icons/icon-48.png` | `user-uploads://48.png` |
| `public/icons/icon-40.png` | `user-uploads://40.png` |
| `public/icons/icon-32.png` | `user-uploads://32.png` |
| `public/icons/icon-29.png` | `user-uploads://29.png` |
| `public/icons/icon-20.png` | `user-uploads://20.png` |
| `public/icons/icon-16.png` | `user-uploads://16.png` |
| `public/icons/Contents.json` | `user-uploads://Contents.json` |

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Update apple-touch-icon and favicon link tags |

## Platform Coverage Summary

| Platform | Requirement | Status |
|----------|-------------|--------|
| iOS App Store | 1024x1024 | Complete (appstore.png) |
| Google Play Store | 512x512 | Complete (playstore.png) |
| iPhone (all densities) | 60-180px | Complete |
| iPad (all densities) | 76-167px | Complete |
| Apple Watch | 48-258px | Complete |
| Android Launcher | Various | Complete (ic_launcher files) |
| Android Densities | mdpi-xxxhdpi | Complete |
| Browser Favicons | 16px, 32px | Complete |
| PWA | 192px+ | Complete |

## Total Files

- **44 icon files** to be copied to `public/icons/`
- **1 file** to be modified (`index.html`)

## Result

After implementation, your Stackd app will have:
- Complete iOS App Store submission readiness with `appstore.png`
- Complete Google Play Store submission readiness with `playstore.png`
- Android launcher icons in all required densities
- Full iOS device coverage (iPhone, iPad, iPad Pro, Apple Watch)
- Browser favicon support
- PWA icon support
- All icons organized in `public/icons/` for easy native project setup

