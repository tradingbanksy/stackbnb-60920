
# Plan: Pre-fill Tulum Location and Pass Selected Date to Bookings

## Overview

Make the AppView search bar show "Tulum" as a fixed, non-editable location and pass the selected date from the "When?" calendar to restaurant and experience booking forms.

## Current State

- **Location field** in AppView (`src/pages/guest/AppView.tsx` line 370-375): An editable `Input` component with placeholder "Where to?"
- **Date selection** (`line 139`): A `selectedDate` state variable that currently doesn't persist anywhere
- **BookingForm** (`src/pages/guest/BookingForm.tsx` line 29-33): Uses local state `formData.date` initialized to empty string
- **RestaurantDetail** (`src/pages/guest/RestaurantDetail.tsx`): No date pre-filling for reservations

## Changes

### Step 1: Make Location Non-Editable with "Tulum" Pre-filled

**File:** `src/pages/guest/AppView.tsx`

Replace the editable Input with a styled static display:

```tsx
// Before (lines 369-375):
<MapPin className="h-4 w-4 text-primary flex-shrink-0" />
<Input
  placeholder="Where to?"
  value={locationQuery}
  onChange={(e) => setLocationQuery(e.target.value)}
  className="border-0 bg-transparent..."
/>

// After:
<MapPin className="h-4 w-4 text-primary flex-shrink-0" />
<span className="text-sm text-foreground font-medium">Tulum</span>
```

- Remove `locationQuery` state variable (line 138) since it's no longer needed
- Remove the input and replace with a static styled text element

### Step 2: Create a Global Search Date Context

**New File:** `src/contexts/SearchContext.tsx`

Create a context to share the selected date across the app:

```tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SearchContextType {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  destination: string;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const stored = sessionStorage.getItem('searchSelectedDate');
    return stored ? new Date(stored) : undefined;
  });

  useEffect(() => {
    if (selectedDate) {
      sessionStorage.setItem('searchSelectedDate', selectedDate.toISOString());
    } else {
      sessionStorage.removeItem('searchSelectedDate');
    }
  }, [selectedDate]);

  return (
    <SearchContext.Provider value={{ 
      selectedDate, 
      setSelectedDate, 
      destination: 'Tulum' 
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
```

### Step 3: Add SearchProvider to App

**File:** `src/contexts/UserContext.tsx`

Wrap the app with SearchProvider:

```tsx
import { SearchProvider } from './SearchContext';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SignupProvider>
      <BookingProvider>
        <SearchProvider>
          <LegacyCleanup />
          {children}
        </SearchProvider>
      </BookingProvider>
    </SignupProvider>
  );
};
```

### Step 4: Update AppView to Use Context

**File:** `src/pages/guest/AppView.tsx`

- Remove local `selectedDate` state (line 139)
- Remove `locationQuery` state (line 138)
- Import and use `useSearch` context:

```tsx
import { useSearch } from "@/contexts/SearchContext";

// In component:
const { selectedDate, setSelectedDate } = useSearch();
```

### Step 5: Pre-fill Date in BookingForm

**File:** `src/pages/guest/BookingForm.tsx`

```tsx
import { useSearch } from "@/contexts/SearchContext";
import { format } from "date-fns";

const BookingForm = () => {
  const { selectedDate: searchDate } = useSearch();
  
  const [formData, setFormData] = useState({
    date: searchDate ? format(searchDate, 'yyyy-MM-dd') : '',
    time: '',
    guests: 1,
  });
  // ... rest unchanged
};
```

### Step 6: Pre-fill Date in RestaurantDetail Reservation

**File:** `src/pages/guest/RestaurantDetail.tsx`

When user clicks "Make a Reservation", pass the date:

```tsx
import { useSearch } from "@/contexts/SearchContext";

// In component:
const { selectedDate } = useSearch();

// When opening reservation iframe, append date if available
const handleReservation = () => {
  if (restaurant.reservationUrl) {
    // Add date parameter if the platform supports it
    const url = new URL(restaurant.reservationUrl);
    if (selectedDate) {
      url.searchParams.set('date', format(selectedDate, 'yyyy-MM-dd'));
    }
    setShowReservationWebview(true);
  }
};
```

## Files Changed

| Action | File |
|--------|------|
| Create | `src/contexts/SearchContext.tsx` |
| Modify | `src/contexts/UserContext.tsx` (add SearchProvider) |
| Modify | `src/pages/guest/AppView.tsx` (static Tulum, use context) |
| Modify | `src/pages/guest/BookingForm.tsx` (pre-fill date) |
| Modify | `src/pages/guest/RestaurantDetail.tsx` (pass date to reservation) |

## User Experience

| Before | After |
|--------|-------|
| "Where to?" empty text input | "Tulum" displayed as fixed text |
| Date selection doesn't persist | Date persists in session storage |
| Booking form date is empty | Date auto-filled from search selection |
| Restaurant reservations have no date | Date passed to reservation systems |

## Technical Notes

- Session storage is used (not localStorage) so the date clears when the browser tab closes
- The destination "Tulum" is hardcoded but stored in context for future flexibility
- Date format uses `yyyy-MM-dd` for HTML date inputs and ISO for storage
