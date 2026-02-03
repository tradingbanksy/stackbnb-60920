

# Plan: Compact Horizontal Role Selection Cards

## Overview

Transform the role selection cards in `/auth` from tall, vertically-stacked cards to slim, horizontal cards that are easier to scroll through on mobile devices.

## Current Design vs New Design

```text
CURRENT (Tall & Stacked):
┌─────────────────────────────┐
│         [👤 Icon]           │
│           Guest             │
│    Discover local exper...  │
└─────────────────────────────┘
┌─────────────────────────────┐
│         [🏢 Icon]           │
│           Host              │
│    List your property...    │
└─────────────────────────────┘
┌─────────────────────────────┐
│         [🏪 Icon]           │
│          Vendor             │
│    Offer your services...   │
└─────────────────────────────┘

NEW (Slim & Horizontal):
┌──────────────────────────────────────────┐
│ [👤]  Guest                              │
│       Discover local experiences         │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ [🏢]  Host                               │
│       List your property                 │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ [🏪]  Vendor                             │
│       Offer services to guests           │
└──────────────────────────────────────────┘
```

## Changes Required

**File:** `src/pages/auth/Auth.tsx`

### Layout Changes (Lines 152-215)

| Aspect | Current | New |
|--------|---------|-----|
| Card padding | `p-6` | `p-4` |
| Flex direction | Column (`flex-col`) | Row (`flex-row`) |
| Icon size | `w-16 h-16` | `w-12 h-12` |
| Icon inner size | `h-8 w-8` | `h-6 w-6` |
| Text alignment | Centered | Left-aligned |
| Card gap | `gap-4` (between icon and text) | `gap-4` (horizontal) |
| Card spacing | `space-y-4` | `space-y-3` |
| Description | Full sentences | Shortened (one line) |

### New Card Structure

```tsx
<button className="group w-full p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm
  transition-all duration-300 hover:border-blue-500/50 hover:bg-card/80 hover:scale-[1.01]
  hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] focus:outline-none">
  <div className="flex items-center gap-4">
    {/* Smaller icon */}
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 
      flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
      <Users className="h-6 w-6 text-white" />
    </div>
    {/* Left-aligned text */}
    <div className="text-left">
      <h3 className="text-lg font-bold text-foreground">Guest</h3>
      <p className="text-sm text-muted-foreground">Discover local experiences</p>
    </div>
  </div>
</button>
```

### Shortened Descriptions

| Role | Current | New (Shorter) |
|------|---------|---------------|
| Guest | "Discover local experiences and activities curated by your host." | "Discover local experiences" |
| Host | "List your property and connect with vendors to offer curated experiences to your guests." | "Curate experiences for guests" |
| Vendor | "Offer your services and experiences to guests through partner hosts." | "Offer services to guests" |

## Visual Comparison

**Current Height:** ~400px total for 3 cards
**New Height:** ~200px total for 3 cards (50% reduction)

## Benefits

- Faster visual scanning
- Less scrolling on mobile
- Cleaner, more modern look
- Better touch targets (still 48px+ height)
- Fits more content above the fold

