

# Plan: Update Guest Icon to Mustard Color with Radiant Glow

## Overview

Change the Guest role card icon from baby blue to a mustard/amber color that matches the stackd logo branding, with the same radiant glow effect used on Host and Vendor cards.

## Current vs New Design

```text
CURRENT Guest Card:
┌──────────────────────────────────────────┐
│ [👤 Blue]  Guest                         │
│            Discover local experiences    │
└──────────────────────────────────────────┘
Icon gradient: from-blue-400 to-cyan-500
Hover border: border-blue-500/50
Hover shadow: rgba(59,130,246,0.15) (blue glow)

NEW Guest Card:
┌──────────────────────────────────────────┐
│ [👤 Mustard/Amber]  Guest                │
│                     Discover local exp.  │
└──────────────────────────────────────────┘
Icon gradient: from-amber-400 to-yellow-500
Hover border: border-amber-500/50
Hover shadow: rgba(245,158,11,0.15) (amber glow)
```

## Changes Required

**File:** `src/pages/auth/Auth.tsx`

### Line 157-162 Changes

| Element | Current | New |
|---------|---------|-----|
| Icon gradient | `from-blue-400 to-cyan-500` | `from-amber-400 to-yellow-500` |
| Hover border | `hover:border-blue-500/50` | `hover:border-amber-500/50` |
| Hover shadow | `rgba(59,130,246,0.15)` (blue) | `rgba(245,158,11,0.15)` (amber) |

### Updated Code

```tsx
{/* Guest Card */}
<button
  onClick={() => handleRoleSelect("user")}
  className="group w-full p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm
    transition-all duration-300 hover:border-amber-500/50 hover:bg-card/80 hover:scale-[1.01]
    hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)] focus:outline-none"
>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 
      flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
      <Users className="h-6 w-6 text-white" />
    </div>
    <div className="text-left">
      <h3 className="text-lg font-bold text-foreground">Guest</h3>
      <p className="text-sm text-muted-foreground">Discover local experiences</p>
    </div>
  </div>
</button>
```

## Color Reference

The mustard/amber colors align with the brand's orange-to-purple gradient palette:
- **Amber-400**: `#fbbf24` - warm mustard/gold
- **Yellow-500**: `#eab308` - deeper gold

This creates visual harmony with:
- **Host**: Purple-to-pink gradient
- **Vendor**: Orange-to-pink gradient
- **Guest**: Amber-to-yellow gradient (warm, inviting)

## Visual Result

All three role cards will have distinct, vibrant gradients with matching radiant hover glows:
- Guest: Warm amber glow
- Host: Purple/pink glow  
- Vendor: Orange glow

