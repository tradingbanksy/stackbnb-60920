import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface BookingData {
  experienceId: string;
  experienceName: string;
  vendorName: string;
  date: string;
  time: string;
  guests: number;
  pricePerPerson: number;
  totalPrice: number;
  hostId?: string; // The host who referred the guest (for commission tracking)
  promoCode?: string;
  discountAmount?: number;
  finalPrice?: number;
}

// SECURITY: Payment card data removed entirely - should use tokenized payment processor
export interface GuestData {
  fullName: string;
  email: string;
  phone: string;
}

interface BookingContextType {
  bookingData: BookingData;
  guestData: GuestData;
  updateBookingData: (data: Partial<BookingData>) => void;
  updateGuestData: (data: Partial<GuestData>) => void;
  clearBookingData: () => void;
}

const initialBookingData: BookingData = {
  experienceId: '',
  experienceName: '',
  vendorName: '',
  date: '',
  time: '',
  guests: 1,
  pricePerPerson: 0,
  totalPrice: 0,
  hostId: undefined,
  promoCode: undefined,
  discountAmount: undefined,
  finalPrice: undefined,
};

const initialGuestData: GuestData = {
  fullName: '',
  email: '',
  phone: '',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingData, setBookingData] = useState<BookingData>(() => {
    const stored = sessionStorage.getItem('bookingData');
    return stored ? JSON.parse(stored) : initialBookingData;
  });

  // SECURITY: Guest data (name, email, phone only) stored in sessionStorage
  const [guestData, setGuestData] = useState<GuestData>(() => {
    const stored = sessionStorage.getItem('guestData');
    return stored ? JSON.parse(stored) : initialGuestData;
  });

  useEffect(() => {
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
  }, [bookingData]);

  useEffect(() => {
    sessionStorage.setItem('guestData', JSON.stringify(guestData));
  }, [guestData]);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const updateGuestData = (data: Partial<GuestData>) => {
    setGuestData(prev => ({ ...prev, ...data }));
  };

  const clearBookingData = () => {
    setBookingData(initialBookingData);
    setGuestData(initialGuestData);
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('guestData');
  };

  return (
    <BookingContext.Provider 
      value={{ 
        bookingData,
        guestData,
        updateBookingData,
        updateGuestData,
        clearBookingData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
