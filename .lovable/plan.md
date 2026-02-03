

# Plan: Replace Mock Data with Real Database Queries

## Overview

Remove all hardcoded mock data from the Host dashboard and related pages, replacing them with real-time Supabase database queries. The site will display actual data from the `bookings`, `reviews`, `vendor_profiles`, and `host_vendor_links` tables.

## Current State Analysis

### Database Reality (as of now)
| Metric | Value |
|--------|-------|
| Total Bookings | 0 |
| Total Reviews | 0 |
| Published Vendors | 9 |
| Host-Vendor Links | 3 |
| Total Profiles | 37 |

The vendor dashboard (`src/pages/vendor/Dashboard.tsx`) is **already using real data** via Supabase queries. The host pages still rely on mock data.

### Mock Data Usage Found

| File | Mock Data Used | Needs Real Query |
|------|----------------|------------------|
| `src/pages/host/Dashboard.tsx` | `dashboardStats`, `recentBookings` | Yes - earnings, bookings, vendor counts, ratings |
| `src/pages/host/Bookings.tsx` | `recentBookings` | Yes - host's booking history |
| `src/pages/host/Earnings.tsx` | Local `earningsData` array | Yes - host's commission earnings |
| `src/pages/host/ActiveVendors.tsx` | `vendors` | Yes - host's linked vendors |
| `src/pages/host/Ratings.tsx` | Local `ratingsData` array | Yes - reviews for vendors host referred |

## Data Flow Architecture

```text
HOST DASHBOARD METRICS:
┌─────────────────────────────────────────────────────────────┐
│  Total Earnings  │  Bookings  │  Active Vendors  │  Rating  │
├──────────────────┼────────────┼──────────────────┼──────────┤
│  SUM of          │  COUNT of  │  COUNT of        │  AVG of  │
│  host_payout_    │  bookings  │  host_vendor_    │  reviews │
│  amount from     │  where     │  links where     │  for     │
│  bookings where  │  host_     │  host_user_id    │  vendors │
│  host_user_id    │  user_id   │  = current user  │  linked  │
│  = current user  │  = current │                  │  to host │
│                  │  user      │                  │          │
└──────────────────┴────────────┴──────────────────┴──────────┘
```

## Implementation Details

### Phase 1: Host Dashboard - Real Stats

**File:** `src/pages/host/Dashboard.tsx`

Replace the imported `dashboardStats` with a React Query hook:

```typescript
const { data: stats, isLoading: isLoadingStats } = useQuery({
  queryKey: ['hostDashboardStats', user?.id],
  queryFn: async () => {
    if (!user) return [];

    // Fetch bookings where this host referred the customer
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_amount, host_payout_amount')
      .eq('host_user_id', user.id)
      .eq('status', 'completed');

    const totalEarnings = bookings?.reduce((sum, b) => sum + (b.host_payout_amount || 0), 0) || 0;
    const bookingCount = bookings?.length || 0;

    // Count linked vendors
    const { count: vendorCount } = await supabase
      .from('host_vendor_links')
      .select('*', { count: 'exact', head: true })
      .eq('host_user_id', user.id);

    // Calculate average rating from reviews on linked vendors
    const { data: linkedVendors } = await supabase
      .from('host_vendor_links')
      .select('vendor_profile_id')
      .eq('host_user_id', user.id);

    let avgRating = 'N/A';
    if (linkedVendors && linkedVendors.length > 0) {
      const vendorIds = linkedVendors.map(v => v.vendor_profile_id);
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('vendor_profile_id', vendorIds);
      
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        avgRating = avg.toFixed(1) + '★';
      }
    }

    return [
      { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, icon: "DollarSign" },
      { label: "Bookings", value: bookingCount.toString(), icon: "Calendar" },
      { label: "Active Vendors", value: (vendorCount || 0).toString(), icon: "Users" },
      { label: "Avg Rating", value: avgRating, icon: "Star" },
    ];
  },
  enabled: !!user,
});
```

Replace the imported `recentBookings` with real data:

```typescript
const { data: recentBookings = [], isLoading: isLoadingBookings } = useQuery({
  queryKey: ['hostRecentBookings', user?.id],
  queryFn: async () => {
    if (!user) return [];

    const { data } = await supabase
      .from('bookings')
      .select('experience_name, vendor_name, booking_date, host_payout_amount')
      .eq('host_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return data?.map(b => ({
      service: b.experience_name,
      vendor: b.vendor_name || 'Unknown Vendor',
      date: new Date(b.booking_date).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }),
      amount: `$${(b.host_payout_amount || 0).toFixed(0)}`,
    })) || [];
  },
  enabled: !!user,
});
```

### Phase 2: Host Bookings Page

**File:** `src/pages/host/Bookings.tsx`

Replace mock data with real query:

```typescript
const { data: bookings = [], isLoading } = useQuery({
  queryKey: ['hostAllBookings', user?.id],
  queryFn: async () => {
    if (!user) return [];

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('host_user_id', user.id)
      .order('booking_date', { ascending: false });

    return data || [];
  },
  enabled: !!user,
});

const totalRevenue = bookings.reduce((sum, b) => sum + (b.host_payout_amount || 0), 0);
```

### Phase 3: Host Earnings Page

**File:** `src/pages/host/Earnings.tsx`

Replace local `earningsData` array:

```typescript
const { data: earnings = [], isLoading } = useQuery({
  queryKey: ['hostEarnings', user?.id],
  queryFn: async () => {
    if (!user) return [];

    const { data } = await supabase
      .from('bookings')
      .select('experience_name, vendor_name, host_payout_amount, booking_date')
      .eq('host_user_id', user.id)
      .eq('status', 'completed')
      .order('booking_date', { ascending: false });

    return data?.map((b, i) => ({
      id: i + 1,
      service: b.experience_name,
      vendor: b.vendor_name || 'Unknown',
      amount: b.host_payout_amount || 0,
      date: new Date(b.booking_date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      }),
    })) || [];
  },
  enabled: !!user,
});
```

### Phase 4: Host Active Vendors Page

**File:** `src/pages/host/ActiveVendors.tsx`

Replace mock `vendors` import:

```typescript
const { data: vendors = [], isLoading } = useQuery({
  queryKey: ['hostLinkedVendors', user?.id],
  queryFn: async () => {
    if (!user) return [];

    // Get linked vendor IDs
    const { data: links } = await supabase
      .from('host_vendor_links')
      .select('vendor_profile_id')
      .eq('host_user_id', user.id);

    if (!links || links.length === 0) return [];

    const vendorIds = links.map(l => l.vendor_profile_id);

    // Fetch vendor profiles
    const { data: profiles } = await supabase
      .from('vendor_profiles')
      .select('id, name, category, description, commission_percentage')
      .in('id', vendorIds);

    return profiles || [];
  },
  enabled: !!user,
});
```

### Phase 5: Host Ratings Page

**File:** `src/pages/host/Ratings.tsx`

Replace local `ratingsData` array:

```typescript
const { data: reviews = [], isLoading } = useQuery({
  queryKey: ['hostVendorReviews', user?.id],
  queryFn: async () => {
    if (!user) return [];

    // Get linked vendor IDs
    const { data: links } = await supabase
      .from('host_vendor_links')
      .select('vendor_profile_id')
      .eq('host_user_id', user.id);

    if (!links || links.length === 0) return [];

    const vendorIds = links.map(l => l.vendor_profile_id);

    // Fetch reviews for these vendors
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        vendor_profile_id,
        booking_id,
        vendor_profiles!inner (name)
      `)
      .in('vendor_profile_id', vendorIds)
      .order('created_at', { ascending: false });

    return reviewsData || [];
  },
  enabled: !!user,
});
```

## Empty State Handling

Since the database currently has 0 bookings and 0 reviews, we need proper empty states:

```text
┌─────────────────────────────────────────────────────────────┐
│                    EMPTY STATE DESIGN                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     [Calendar Icon]                         │
│                                                             │
│              No bookings yet                                │
│                                                             │
│    Your earnings will appear here once guests              │
│    book experiences through your referrals                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/host/Dashboard.tsx` | Remove mock imports, add useQuery for stats and recent bookings |
| `src/pages/host/Bookings.tsx` | Remove mock import, add useQuery for all bookings |
| `src/pages/host/Earnings.tsx` | Remove local array, add useQuery for earnings |
| `src/pages/host/ActiveVendors.tsx` | Remove mock import, add useQuery for linked vendors |
| `src/pages/host/Ratings.tsx` | Remove local array, add useQuery for reviews |

## Metric Accuracy Verification

| Metric | Source | Calculation |
|--------|--------|-------------|
| Total Earnings | `bookings.host_payout_amount` | SUM where `host_user_id` = current user AND `status` = 'completed' |
| Bookings | `bookings` table | COUNT where `host_user_id` = current user |
| Active Vendors | `host_vendor_links` | COUNT where `host_user_id` = current user |
| Avg Rating | `reviews` via `host_vendor_links` | AVG of reviews on vendors linked to this host |
| Recent Activity | `bookings` | Latest 5 bookings where `host_user_id` = current user |

## Benefits

| Aspect | Before (Mock) | After (Real) |
|--------|---------------|--------------|
| Data accuracy | Static fake numbers | Live database values |
| User trust | Shows fake earnings | Shows actual $0 (honest) |
| Actionable | No | Yes - users see real progress |
| Scalability | None | Automatic as data grows |

## Note on Guest Pages

The guest-facing pages (`AppView.tsx`, `Explore.tsx`, etc.) use `experiences` and `mockRestaurants` for discovery. These should remain as-is for now since they represent curated marketplace listings, not user-specific data. The vendor_profiles table already populates the real vendor discovery, and restaurant data comes from TripAdvisor API.

