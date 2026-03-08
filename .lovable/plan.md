

# AI Chat (Trip Planner) -- Comprehensive Review & Improvement Plan

## Issues Found

### 1. Tulum-Only Hardcoding (Product Limitation)
The system prompt is 100% Tulum-specific -- cenote lists, restaurant names, geography distances. The `getInitialMessage()` always says "Tulum travel assistant." If a user asks about Cancun or Playa del Carmen, JC still recites Tulum data. The `extractDestination` function has a KNOWN_DESTINATIONS list but the AI prompt ignores it entirely.

**Fix:** Add destination awareness to the system prompt. When the user mentions a non-Tulum destination, JC should acknowledge it doesn't have curated local data and rely on its general knowledge, rather than forcing Tulum recommendations.

### 2. Initial Message Ignores System Prompt Instructions
The system prompt says "ask for dates FIRST" but `getInitialMessage()` returns a generic greeting that doesn't ask for dates. The AI's first actual response (after the user sends something) will ask for dates, but the static greeting contradicts the AI's intended behavior -- it says "Ask me about cenotes, beach clubs..." inviting immediate activity questions before dates are established.

**Fix:** Update `getInitialMessage()` to include a date question, matching the system prompt's behavior.

### 3. Auto-Scroll Only Triggers on `messages.length` Change
`ChatMessageList` scrolls on `messages.length` change, but during streaming the length doesn't change -- only the last message's content updates. This means the user doesn't auto-scroll as the AI response streams in. They have to manually scroll down to see new content.

**Fix:** Add the last message's content length (or a streaming flag) to the scroll effect dependencies, or use a separate streaming scroll interval.

### 4. Rate Limiting Uses IP Only -- Easily Bypassed
The edge function rate-limits by IP (`chat:${ip}`), but the auth token (now sent) is not used for per-user rate limiting. Multiple users behind the same NAT get collectively rate-limited, while a single user with a VPN can bypass it entirely.

**Fix:** When an auth token is present, rate-limit by user ID instead of IP. Fall back to IP for unauthenticated requests.

### 5. No Message Deduplication on Fast Double-Tap
If a user double-taps send quickly, `sendMessage` checks `isLoading` but the state update is async. Two rapid calls can both pass the `!isLoading` check before either sets it to `true`, resulting in duplicate messages.

**Fix:** Use a ref-based guard (`isSendingRef`) set synchronously before the async flow begins.

### 6. Chat History Grows Unbounded in localStorage
Messages accumulate forever in localStorage. After extended use, this can hit the ~5MB localStorage limit, causing silent data loss. The edge function truncates to 50 messages, but the client stores everything.

**Fix:** Cap stored messages to the same 50-message limit used by the edge function, trimming oldest messages first.

### 7. "Saved" Badge Shows for Unauthenticated Users
The `ChatHeader` always shows the "Saved" / "Saving..." badge, even for non-authenticated users whose chat is NOT being persisted. This is misleading.

**Fix:** Only show the save status badge when `isAuthenticated` is true.

### 8. Bionic Reading Breaks Markdown
`applyBionicReading` wraps word prefixes in `**bold**`, but the input is already markdown. This creates nested/broken markdown like `****bold****` or breaks links and code blocks.

**Fix:** Apply bionic reading at the React rendering level (post-parse), not on raw markdown text.

### 9. System Prompt is ~4,000 Tokens
The system prompt is extremely long (~200 lines of instructions, examples, knowledge base). Every single API call sends this. This adds latency and cost, especially since most instructions are rarely relevant to a given turn.

**Fix:** Split the system prompt: keep core personality and rules compact (~1,000 tokens). Move the Tulum knowledge base and formatting examples into a separate "reference" section that's only appended when relevant (e.g., first message or when activities are being discussed).

### 10. No Error Handling for 402/429 in Frontend
The `TripPlannerChatContext` catches generic errors but doesn't specifically handle 429 (rate limit) or 402 (payment required) responses from the edge function. Users see a generic "Failed to get AI response" instead of actionable feedback.

**Fix:** Parse the response status and show specific messages: "You're sending messages too quickly, please wait a moment" for 429, and "Service temporarily unavailable" for 402.

### 11. Clearing Chat Doesn't Clear Itinerary
`clearChat()` resets messages but doesn't call `clearItinerary()`. A user who starts a new conversation still sees their old itinerary data, which creates confusion when the new chat generates different activities.

**Fix:** Offer to clear the itinerary when clearing chat, or at minimum reset the itinerary context.

### 12. `ItinerarySheet` Skeleton Animation Leaks Intervals
Lines 119-124: the skeleton animation creates a `setInterval` inside the render body (not in a `useEffect`), which leaks intervals and causes multiple concurrent intervals on re-renders.

**Fix:** Move to a proper `useEffect` with cleanup.

---

## Implementation Priority

1. **Fix auto-scroll during streaming** (high-impact UX)
2. **Fix double-send race condition** (bug)
3. **Fix skeleton interval leak** (memory leak)
4. **Update initial message to ask for dates** (consistency)
5. **Hide "Saved" badge for unauthenticated users** (misleading UI)
6. **Add 429/402 specific error handling** (UX)
7. **Cap localStorage chat history at 50 messages** (stability)
8. **Fix bionic reading markdown breakage** (feature bug)
9. **Clear itinerary option on chat reset** (UX)
10. **Per-user rate limiting when authenticated** (security)
11. **Optimize system prompt length** (performance/cost)
12. **Add destination awareness** (product scope)

---

## Files to Edit

| File | Changes |
|------|---------|
| `src/features/trip-planner/components/ChatMessageList.tsx` | Fix auto-scroll to track streaming content |
| `src/features/trip-planner/context/TripPlannerChatContext.tsx` | Fix double-send race, cap history, handle 429/402, link clearChat to itinerary |
| `src/features/trip-planner/components/ChatHeader.tsx` | Conditionally show save badge |
| `src/features/trip-planner/components/ItinerarySheet.tsx` | Fix interval leak |
| `src/features/trip-planner/utils/index.ts` | Fix bionic reading, update initial message |
| `supabase/functions/trip-planner-chat/index.ts` | Add per-user rate limiting |

