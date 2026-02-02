

# Plan: Simplify AI Trip Planning to Auto-Optimize Logistics

## Problem

Currently, JC (the AI) asks detailed, potentially overwhelming questions like:
> "How would you like to structure your days? For example, would you prefer to have the more active snorkeling day at the beginning, or save the massage for a specific day?"

This puts the burden of logistics on the guest, who likely doesn't know Tulum's geography or optimal activity groupings.

## Solution

Make JC proactive and simple. After confirming a few activities, JC should offer:
> "Would you like me to space these activities out for you, add some lunch spots, dinners, and downtime? I'll make sure the travel between locations flows smoothly."

When the guest agrees, JC should automatically:
1. Consider travel times between locations
2. Group geographically close activities
3. Add meal suggestions near the activity locations
4. Include appropriate downtime/rest periods
5. Create a smooth, logical flow for each day

## Changes Required

### Update System Prompt (Edge Function)

**File:** `supabase/functions/trip-planner-chat/index.ts`

Add new instructions that:

1. **Remove detailed planning questions** - Don't ask guests to make complex scheduling decisions
2. **Proactive optimization offer** - After 2-3 activities are confirmed, offer to build out the full days with meals and flow
3. **Auto-optimize logistics** - When guest agrees, automatically:
   - Group activities by geography (cenotes in morning near each other, beach zone afternoon)
   - Add lunch near morning activities, dinner near evening activities
   - Include 1-2 hour rest/pool time between active excursions
   - Calculate and factor in travel times
4. **Simple confirmation** - Just ask "Does this flow work for you?" instead of detailed options

### New Prompt Additions

```
**SIMPLIFIED PLANNING APPROACH:**
After the guest confirms 2-3 activities, proactively offer to optimize their schedule:

"I've got [X activities] confirmed! Would you like me to space these out for you, add some great lunch and dinner spots, and build in some downtime? I'll make sure the travel between locations flows smoothly so you're not rushing around."

When they agree, automatically:
1. Group activities by geographic proximity (morning cenotes together, afternoon beach zone together)
2. Add meal suggestions near activity locations (not the other way around)
3. Include 1-2 hours of downtime/pool time between active excursions
4. Factor in travel times to create a relaxed pace
5. Present the optimized day as a complete flow

**DO NOT ask detailed questions like:**
- "How would you like to structure your days?"
- "Would you prefer active mornings or evenings?"
- "Should we save the massage for a specific day?"

**INSTEAD, be proactive:**
- "Here's how I'd lay out Day 1 for a smooth flow..."
- "I've spaced things out with lunch at [nearby spot] between activities"
- "This gives you a 2-hour break at the pool before dinner"

**OPTIMIZED DAY EXAMPLE:**
When building out a day, present it like this:

---
**Day 1 - Cenotes & Beach Vibes** 🫧🏖️

**Morning**
8:00am - Gran Cenote (2 hrs) - Beat the crowds!
↓ 10 min drive

**Late Morning**
10:30am - Cenote Calavera (1.5 hrs) - Cliff jumping!
↓ 15 min drive to town

**Lunch**
12:30pm - Burrito Amor 🌯 - Quick, delicious, affordable
↓ 15 min drive to beach zone

**Afternoon**
2:30pm - Downtime at your hotel/pool 🏊
↓ 5 min walk

**Sunset**
5:00pm - Ziggy's Beach Club 🍹 - Catch sunset, stay for dinner

---

This format shows the logical flow with travel times built in.
```

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Planning style | Asks detailed questions about preferences | Proactively offers to optimize |
| Meal additions | Guest must request | JC suggests adding meals automatically |
| Travel times | Mentioned but not optimized | Built into the flow with clear timing |
| Downtime | Not considered | Explicitly added between activities |
| Day presentation | Activity-by-activity | Complete day flow with transitions |

## Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/trip-planner-chat/index.ts` | Update system prompt with simplified planning approach, proactive optimization offer, and optimized day format |

