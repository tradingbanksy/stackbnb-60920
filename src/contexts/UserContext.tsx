import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// SECURITY: Password fields removed from stored data - only used during form submission
interface HostSignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PropertyData {
  propertyName: string;
  airbnbUrl: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

// SECURITY: Password fields removed from stored data - only used during form submission
interface VendorSignupData {
  businessName: string;
  businessType: string;
  contactName: string;
  email: string;
  phone: string;
}

// SECURITY: taxId removed - should only be submitted directly to server
interface BusinessData {
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
}

interface BookingData {
  experienceId: string;
  experienceName: string;
  vendorName: string;
  date: string;
  time: string;
  guests: number;
  pricePerPerson: number;
  totalPrice: number;
}

// SECURITY: Payment card data removed entirely - should use tokenized payment processor
interface GuestData {
  fullName: string;
  email: string;
  phone: string;
}

// Note: Authentication is handled by AuthContext using Supabase sessions
// This context only manages signup flow data and booking data
// SECURITY: Sensitive data (passwords, payment info, tax IDs) are NOT stored
interface UserContextType {
  hostSignupData: HostSignupData;
  propertyData: PropertyData;
  vendorSignupData: VendorSignupData;
  businessData: BusinessData;
  bookingData: BookingData;
  guestData: GuestData;
  updateHostSignupData: (data: Partial<HostSignupData>) => void;
  updatePropertyData: (data: Partial<PropertyData>) => void;
  updateVendorSignupData: (data: Partial<VendorSignupData>) => void;
  updateBusinessData: (data: Partial<BusinessData>) => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  updateGuestData: (data: Partial<GuestData>) => void;
  clearSignupData: () => void;
}

const initialHostSignupData: HostSignupData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const initialPropertyData: PropertyData = {
  propertyName: '',
  airbnbUrl: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

const initialVendorSignupData: VendorSignupData = {
  businessName: '',
  businessType: '',
  contactName: '',
  email: '',
  phone: '',
};

const initialBusinessData: BusinessData = {
  address: '',
  city: '',
  state: '',
  zip: '',
  description: '',
};

const initialBookingData: BookingData = {
  experienceId: '',
  experienceName: '',
  vendorName: '',
  date: '',
  time: '',
  guests: 1,
  pricePerPerson: 0,
  totalPrice: 0,
};

const initialGuestData: GuestData = {
  fullName: '',
  email: '',
  phone: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Signup flow data - stored in sessionStorage for multi-step form persistence
  // SECURITY: Using sessionStorage instead of localStorage (clears on browser close)
  const [hostSignupData, setHostSignupData] = useState<HostSignupData>(() => {
    const stored = sessionStorage.getItem('hostSignupData');
    return stored ? JSON.parse(stored) : initialHostSignupData;
  });

  const [propertyData, setPropertyData] = useState<PropertyData>(() => {
    const stored = sessionStorage.getItem('propertyData');
    return stored ? JSON.parse(stored) : initialPropertyData;
  });

  const [vendorSignupData, setVendorSignupData] = useState<VendorSignupData>(() => {
    const stored = sessionStorage.getItem('vendorSignupData');
    return stored ? JSON.parse(stored) : initialVendorSignupData;
  });

  const [businessData, setBusinessData] = useState<BusinessData>(() => {
    const stored = sessionStorage.getItem('businessData');
    return stored ? JSON.parse(stored) : initialBusinessData;
  });

  const [bookingData, setBookingData] = useState<BookingData>(() => {
    const stored = sessionStorage.getItem('bookingData');
    return stored ? JSON.parse(stored) : initialBookingData;
  });

  // SECURITY: Guest data (name, email, phone only) stored in sessionStorage
  const [guestData, setGuestData] = useState<GuestData>(() => {
    const stored = sessionStorage.getItem('guestData');
    return stored ? JSON.parse(stored) : initialGuestData;
  });

  // Clean up old vulnerable localStorage keys on mount
  useEffect(() => {
    // Remove old localStorage data (migrating to sessionStorage)
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasCompletedSignup');
    localStorage.removeItem('hostSignupData');
    localStorage.removeItem('propertyData');
    localStorage.removeItem('vendorSignupData');
    localStorage.removeItem('businessData');
    localStorage.removeItem('bookingData');
    localStorage.removeItem('guestData');
  }, []);

  // Persist signup flow data to sessionStorage (non-sensitive data only)
  useEffect(() => {
    sessionStorage.setItem('hostSignupData', JSON.stringify(hostSignupData));
  }, [hostSignupData]);

  useEffect(() => {
    sessionStorage.setItem('propertyData', JSON.stringify(propertyData));
  }, [propertyData]);

  useEffect(() => {
    sessionStorage.setItem('vendorSignupData', JSON.stringify(vendorSignupData));
  }, [vendorSignupData]);

  useEffect(() => {
    sessionStorage.setItem('businessData', JSON.stringify(businessData));
  }, [businessData]);

  useEffect(() => {
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
  }, [bookingData]);

  useEffect(() => {
    sessionStorage.setItem('guestData', JSON.stringify(guestData));
  }, [guestData]);

  const updateHostSignupData = (data: Partial<HostSignupData>) => {
    setHostSignupData(prev => ({ ...prev, ...data }));
  };

  const updatePropertyData = (data: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...data }));
  };

  const updateVendorSignupData = (data: Partial<VendorSignupData>) => {
    setVendorSignupData(prev => ({ ...prev, ...data }));
  };

  const updateBusinessData = (data: Partial<BusinessData>) => {
    setBusinessData(prev => ({ ...prev, ...data }));
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const updateGuestData = (data: Partial<GuestData>) => {
    setGuestData(prev => ({ ...prev, ...data }));
  };

  const clearSignupData = () => {
    setHostSignupData(initialHostSignupData);
    setPropertyData(initialPropertyData);
    setVendorSignupData(initialVendorSignupData);
    setBusinessData(initialBusinessData);
    sessionStorage.removeItem('hostSignupData');
    sessionStorage.removeItem('propertyData');
    sessionStorage.removeItem('vendorSignupData');
    sessionStorage.removeItem('businessData');
  };

  return (
    <UserContext.Provider 
      value={{ 
        hostSignupData, 
        propertyData,
        vendorSignupData,
        businessData,
        bookingData,
        guestData,
        updateHostSignupData, 
        updatePropertyData,
        updateVendorSignupData,
        updateBusinessData,
        updateBookingData,
        updateGuestData,
        clearSignupData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
