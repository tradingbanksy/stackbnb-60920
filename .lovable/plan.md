

# Phase 2: Messaging Safety, Fraud Detection, Experience Guarantee (Features 6, 7, 8)

---

## Feature 6: Platform Messaging System with Fraud Detection

### Database
New tables:

**`conversations`**: `id`, `booking_id` (uuid, references bookings), `guest_user_id`, `host_user_id`, `created_at`, `is_flagged` (bool, default false), `flag_reason` (text)

**`messages`**: `id`, `conversation_id` (uuid), `sender_id` (uuid), `content` (text), `is_flagged` (bool, default false), `flag_reason` (text), `created_at`

Enable realtime on `messages` table.

RLS: Participants can SELECT/INSERT on their own conversations. No UPDATE/DELETE on messages (immutable). Admins can SELECT all.

### Fraud Detection (in-message)
A database trigger `check_message_content()` runs on INSERT to `messages`. It regex-checks content for: phone number patterns, "whatsapp", "telegram", "venmo", "paypal", "cashapp", "zelle", "pay me directly", "wire transfer". If matched, sets `is_flagged = true` and `flag_reason` on both the message and its parent conversation.

### Frontend
- **Chat UI** (`src/pages/guest/Conversation.tsx`): Simple message thread between guest and host, accessible from booking details. Shows a warning banner if a message is flagged.
- **Admin Moderation Panel** (`src/pages/admin/MessageModeration.tsx`): Lists flagged conversations with message preview, user info, and actions (dismiss flag, warn user, suspend conversation).
- Add link to admin panel from `PlatformSettings.tsx`.

---

## Feature 7: Fraud Detection Rules

### Database
New table **`fraud_alerts`**: `id`, `alert_type` (text: 'duplicate_listing', 'suspicious_pricing', 'rapid_bookings', 'multiple_accounts'), `target_user_id` (uuid), `target_listing_id` (uuid, nullable), `details` (jsonb), `status` (text: 'pending', 'reviewed', 'dismissed'), `created_at`, `reviewed_by` (uuid, nullable), `reviewed_at` (timestamptz)

RLS: Admins only (SELECT, UPDATE).

### Detection Logic
A database function `run_fraud_checks()` triggered by:
1. **On vendor_profiles INSERT**: Check if same `user_id` has 3+ listings → flag "multiple_listings"
2. **On vendor_profiles INSERT**: Check if `price_per_person < 5` → flag "suspicious_pricing"  
3. **On bookings INSERT (via webhook)**: Check if host has < 7 days on platform and > 5 bookings → flag "rapid_bookings"

These are lightweight SQL trigger checks. No IP tracking or image analysis (would require external services beyond current scope — noted as future enhancement).

### Frontend
- **Admin Fraud Queue** (`src/pages/admin/FraudAlerts.tsx`): Table of alerts with type, details, status. Admin can mark as "reviewed" or "dismissed" with notes.
- Add link from `PlatformSettings.tsx`.

---

## Feature 8: Experience Guarantee (Refund Requests)

### Database
New table **`refund_requests`**: `id`, `booking_id` (uuid), `user_id` (uuid), `reason` (text: 'no_show', 'not_as_described', 'cancelled_by_host', 'other'), `description` (text), `evidence_urls` (text[]), `status` (text: 'pending', 'approved', 'denied', default 'pending'), `admin_notes` (text), `reviewed_by` (uuid), `reviewed_at` (timestamptz), `created_at`

RLS: Users can INSERT/SELECT their own. Admins can SELECT/UPDATE all.

New storage bucket **`refund-evidence`** (private): Users upload supporting photos. RLS: owner upload/read, admin read.

### Edge Function
**`process-refund`**: Admin-only function that, when approving a refund request, triggers `stripe.refunds.create` on the booking's payment intent and updates both the refund request status and booking status to 'refunded'.

### Frontend
- **Guest: Request Refund** (`src/pages/guest/RequestRefund.tsx`): Form accessible from booking details for completed/confirmed bookings. Reason dropdown, description textarea, photo upload.
- **Admin: Refund Management** (`src/pages/admin/RefundRequests.tsx`): List of pending requests with booking details, evidence viewer, approve/deny actions.
- Add "Request Refund" button to `MyBookings.tsx` for eligible bookings.
- Add link from `PlatformSettings.tsx`.

---

## Summary of New Files

| File | Purpose |
|------|---------|
| `src/pages/guest/Conversation.tsx` | Guest-host chat UI |
| `src/pages/admin/MessageModeration.tsx` | Flagged message review |
| `src/pages/admin/FraudAlerts.tsx` | Fraud alert queue |
| `src/pages/admin/RefundRequests.tsx` | Refund request management |
| `src/pages/guest/RequestRefund.tsx` | Guest refund request form |
| `supabase/functions/process-refund/index.ts` | Admin refund processing |

**Modified files**: `App.tsx` (routes), `PlatformSettings.tsx` (admin links), `MyBookings.tsx` (chat + refund buttons), `admin/index.ts` (exports).

**Migration**: 1 migration covering all 4 new tables, triggers, storage bucket, and RLS policies.

