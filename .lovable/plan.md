
# Plan: Collaborative Shareable Itineraries

## ✅ COMPLETED - Implementation Summary

### Phase 1: Database Schema ✅

Created two new tables:

1. **`itineraries` table:**
   - `id` (uuid, primary key)
   - `user_id` (uuid)
   - `destination` (text)
   - `start_date` (date)
   - `end_date` (date)
   - `itinerary_data` (jsonb) - Full itinerary including days and items
   - `is_confirmed` (boolean)
   - `share_token` (uuid, unique)
   - `is_public` (boolean)
   - `created_at`, `updated_at` (timestamps)

2. **`itinerary_collaborators` table:**
   - `id` (uuid, primary key)
   - `itinerary_id` (uuid, references itineraries with CASCADE delete)
   - `user_id` (uuid, nullable)
   - `email` (text, for invites)
   - `permission` (text: 'viewer' | 'editor')
   - `invite_token` (uuid)
   - `created_at` (timestamp)

**RLS Policies:**
- Owners can CRUD their own itineraries
- Collaborators can view/edit based on permission
- Public itineraries can be viewed by anyone via share_token
- Realtime enabled on itineraries table

---

### Phase 2: Context Refactor ✅

Updated `ItineraryContext.tsx` to:

1. ✅ Persist to database for authenticated users
2. ✅ Load from database on mount
3. ✅ Support collaboration mode
4. ✅ Real-time updates using Supabase Realtime

**New functions added:**
- `saveToDatabase()` - Explicitly persist to database
- `loadFromDatabase()` - Fetch user's itinerary
- `inviteCollaborator(email, permission)` - Add collaborator
- `refreshCollaborators()` - Reload collaborator list

**New context values:**
- `isSyncing` - Whether sync is in progress
- `isConnected` - Realtime connection status
- `userPermission` - Current user's permission level
- `collaborators` - List of collaborators

---

### Phase 3: Shared Itinerary Page ✅

Updated `SharedItinerary.tsx` to support editing:

1. ✅ Permission checks on load (owner, editor, or viewer)
2. ✅ Edit controls visible for users with edit permission
3. ✅ Realtime subscription for collaborative changes
4. ✅ Guest edit mode with localStorage backup
5. ✅ Sign-in prompt for guests to save changes

**UI Features:**
- Inline editing for activity title, description, time
- Delete confirmation dialog
- Add new activity button
- Permission banner showing edit status and sync status
- "Sign In to Save" CTA for guest editors

---

### Phase 4: Sharing Flow ✅

Updated `ShareItineraryDialog.tsx`:

1. ✅ Permission selector (View only / Can edit)
2. ✅ Copy link button
3. ✅ Native share integration
4. ✅ Collaborators tab with invite by email
5. ✅ Manage collaborators list (add/remove)

---

### Phase 5: New Components ✅

Created:

1. **`useItinerarySync.ts`** - Hook for realtime collaboration
   - Subscribes to Supabase Realtime changes
   - Debounced push of local changes to database
   - Handles conflict resolution (last-write-wins)

2. **`CollaboratorsList.tsx`** - Manage collaborators
   - Display current collaborators with permissions
   - Add new collaborators by email
   - Remove collaborators (owner only)

3. **`EditPermissionBanner.tsx`** - Status banner
   - Shows permission level (Owner/Editor/Viewer)
   - Shows sync status (Live/Offline/Saving...)
   - Guest indicator

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/` | ✅ CREATED | Migration for itineraries + collaborators tables |
| `src/features/trip-planner/types/index.ts` | ✅ MODIFIED | Added collaboration types |
| `src/features/trip-planner/hooks/useItinerarySync.ts` | ✅ CREATED | Realtime sync hook |
| `src/features/trip-planner/hooks/index.ts` | ✅ MODIFIED | Export new hook |
| `src/features/trip-planner/context/ItineraryContext.tsx` | ✅ MODIFIED | Database persistence + collaboration |
| `src/features/trip-planner/components/CollaboratorsList.tsx` | ✅ CREATED | Collaborator management UI |
| `src/features/trip-planner/components/EditPermissionBanner.tsx` | ✅ CREATED | Permission status banner |
| `src/features/trip-planner/components/ShareItineraryDialog.tsx` | ✅ MODIFIED | Permission selector + collaborators |
| `src/features/trip-planner/components/ItinerarySheet.tsx` | ✅ MODIFIED | Pass new props to share dialog |
| `src/features/trip-planner/components/index.ts` | ✅ MODIFIED | Export new components |
| `src/pages/SharedItinerary.tsx` | ✅ MODIFIED | Full edit mode + realtime sync |

---

## Expected Outcome ✅

After implementation:
- ✅ Owners can share itineraries with edit or view-only permission
- ✅ Recipients can edit (if allowed) and changes sync in real-time
- ✅ Anonymous users can edit and are prompted to sign in to save
- ✅ All itinerary data is persisted in the database
- ✅ Existing shared links continue to work (legacy fallback)
