
# Plan: Collaborative Shareable Itineraries

## Current State Analysis

After exploring the codebase, I've identified several issues with how the itinerary sharing system currently works:

### Current Problems

1. **Read-only shared itineraries**: When someone receives a shared itinerary link, they can only view it - they cannot edit or add activities

2. **Local-only storage for the owner**: The active itinerary is stored in `localStorage`, meaning:
   - It's not synced across devices
   - It's lost when cache is cleared
   - Only the share snapshot is saved to the database

3. **One-way sharing**: The current flow creates a static snapshot - any changes the owner makes after sharing are not reflected

4. **Anonymous users can't save**: Non-authenticated users can't persist their itinerary

5. **No collaboration**: Recipients cannot contribute to the plan

---

## Proposed Solution

### Architecture Overview

```text
+-------------------+       +---------------------+       +-------------------+
|   Trip Planner    |       |   shared_itineraries|       |  Shared View      |
|   (Owner)         | ----> |   (Database)        | ----> |  (Recipients)     |
+-------------------+       +---------------------+       +-------------------+
        |                           |                              |
        v                           v                              v
  Create/Edit             Real-time sync                    View or Edit
  Itinerary               (owner + collaborators)           (with permissions)
```

### Database Changes

Create a new table structure to support:
- Persistent itinerary storage (not just localStorage)
- Collaborative editing with permission levels
- Real-time sync between owner and recipients

**New tables:**
1. `itineraries` - Store the full itinerary data
2. `itinerary_collaborators` - Track who can edit a shared itinerary

### Permission Levels

| Level | Can View | Can Edit | Can Share | Can Delete |
|-------|----------|----------|-----------|------------|
| Owner | Yes | Yes | Yes | Yes |
| Editor | Yes | Yes | No | No |
| Viewer | Yes | No | No | No |

---

## Implementation Steps

### Phase 1: Database Schema

Create the following tables:

**`itineraries` table:**
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `destination` (text)
- `start_date` (date)
- `end_date` (date)
- `itinerary_data` (jsonb) - Full itinerary including days and items
- `is_confirmed` (boolean)
- `share_token` (uuid, unique)
- `is_public` (boolean, default false)
- `created_at`, `updated_at` (timestamps)

**`itinerary_collaborators` table:**
- `id` (uuid, primary key)
- `itinerary_id` (uuid, references itineraries)
- `user_id` (uuid, nullable for anonymous)
- `email` (text, for invite before signup)
- `permission` (text: 'viewer' | 'editor')
- `invite_token` (uuid, for email invites)
- `created_at` (timestamp)

**RLS Policies:**
- Owners can CRUD their own itineraries
- Collaborators can view/edit based on permission
- Public itineraries can be viewed by anyone via share_token

### Phase 2: Context Refactor

Update `ItineraryContext.tsx` to:

1. **Persist to database** instead of just localStorage
2. **Load from database** on mount for authenticated users
3. **Support collaboration mode** when viewing a shared itinerary
4. **Real-time updates** using Supabase Realtime for collaborators

Key functions to add:
- `saveItineraryToDatabase()` - Persist changes
- `loadItineraryFromDatabase()` - Fetch user's itinerary
- `subscribeToChanges()` - Realtime sync
- `inviteCollaborator(email, permission)` - Send invite

### Phase 3: Shared Itinerary Page Update

Transform `SharedItinerary.tsx` to support editing:

1. **Check permissions** on load (is user owner, editor, or viewer?)
2. **Show edit controls** if user has edit permission
3. **Subscribe to realtime** for collaborative changes
4. **Prompt sign-in** if editing as anonymous (save progress locally, sync after auth)

UI Changes:
- Add "Request Edit Access" button for viewers
- Show collaborator avatars when multiple people are viewing
- Add "Editing as Guest" mode for non-authenticated users

### Phase 4: Sharing Flow Improvements

Update `ShareItineraryDialog.tsx`:

1. **Permission selector** (View only / Can edit)
2. **Copy link** button (existing)
3. **Invite by email** option (new)
4. **Manage collaborators** list

### Phase 5: Sync Guest Edits

For non-authenticated users who edit a shared itinerary:
1. Store changes in localStorage with the share_token
2. Prompt to sign in to save changes permanently
3. After authentication, sync local changes to database

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/` | CREATE | New migration for itineraries table |
| `supabase/migrations/` | CREATE | New migration for itinerary_collaborators table |
| `src/features/trip-planner/context/ItineraryContext.tsx` | MODIFY | Add database persistence and collaboration |
| `src/pages/SharedItinerary.tsx` | MODIFY | Add edit mode and permission checks |
| `src/features/trip-planner/components/ShareItineraryDialog.tsx` | MODIFY | Add permission selector and invite options |
| `src/features/trip-planner/components/CollaboratorsList.tsx` | CREATE | New component to show/manage collaborators |
| `src/features/trip-planner/components/EditPermissionBanner.tsx` | CREATE | Banner showing edit status for shared itineraries |
| `src/features/trip-planner/hooks/useItinerarySync.ts` | CREATE | Hook for realtime collaboration |
| `src/integrations/supabase/types.ts` | AUTO-UPDATE | Will reflect new tables |

---

## Technical Details

### Realtime Collaboration Setup

```text
// Enable realtime on the itineraries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.itineraries;
```

The sync hook will:
1. Subscribe to changes on the specific itinerary record
2. Debounce local edits before pushing to database
3. Merge incoming remote changes with local state
4. Handle conflict resolution (last-write-wins with timestamp)

### Guest Edit Flow

```text
1. Guest opens shared link with edit permission
2. Guest makes changes (stored in localStorage)
3. Guest prompted to sign in before leaving
4. On sign-in: local changes synced to database
5. Future visits: changes persist across devices
```

### Migration Strategy for Existing Data

The `shared_itineraries` table will be migrated:
- Keep existing share links working
- Copy `itinerary_data` to new `itineraries` table
- Update `SharedItinerary.tsx` to check both tables

---

## Expected Outcome

After implementation:
- Owners can share itineraries with edit or view-only permission
- Recipients can edit (if allowed) and changes sync in real-time
- Anonymous users can edit and are prompted to sign in to save
- All itinerary data is persisted in the database, not just localStorage
- Existing shared links continue to work
