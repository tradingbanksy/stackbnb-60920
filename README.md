# stackd

stackd is a three-sided marketplace for guests, hosts, and vendors, with an AI trip planner.

## Setup

You need Node.js and npm. Copy `.env.example` to `.env` and fill in your own values. Do not commit `.env`.

```sh
npm i
npm run dev
```

## Demo seed

Published guest listings come from `vendor_profiles`. To fill Explore / AppView with 8 demo vendors:

1. Apply existing migrations to your Supabase project.
2. Run `supabase/seed.sql` in the SQL editor, **or** apply the additive migration `supabase/migrations/20260913160000_demo_vendor_seed.sql` (`supabase db push` / `supabase db reset`).

`user_id` is a sentinel UUID (`00000000-0000-4000-a000-000000000001`). It is not a real auth user. The table does not require an `auth.users` row for that column.

Stripe checkout still needs test keys in Edge Function secrets. Without them, the booking form and payment summary still work; use **View confirmation preview** after checkout fails.

## Tech

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Supabase
