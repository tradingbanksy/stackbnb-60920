import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface HostSignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface PropertyData {
  propertyName: string;
  airbnbUrl: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface VendorSignupData {
  businessName: string;
  businessType: string;
  contactName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface BusinessData {
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  taxId: string;
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

interface GuestData {
  fullName: string;
  email: string;
  phone: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
}

// Note: Authentication is handled by AuthContext using Supabase sessions
// This context only manages signup flow data and booking data
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
  password: '',
  confirmPassword: '',
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
  password: '',
  confirmPassword: '',
};

const initialBusinessData: BusinessData = {
  address: '',
  city: '',
  state: '',
  zip: '',
  description: '',
  taxId: '',
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
  cardNumber: '',
  expiration: '',
  cvv: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Signup flow data - stored in localStorage for multi-step form persistence
  const [hostSignupData, setHostSignupData] = useState<HostSignupData>(() => {
    const stored = localStorage.getItem('hostSignupData');
    return stored ? JSON.parse(stored) : initialHostSignupData;
  });

  const [propertyData, setPropertyData] = useState<PropertyData>(() => {
    const stored = localStorage.getItem('propertyData');
    return stored ? JSON.parse(stored) : initialPropertyData;
  });

  const [vendorSignupData, setVendorSignupData] = useState<VendorSignupData>(() => {
    const stored = localStorage.getItem('vendorSignupData');
    return stored ? JSON.parse(stored) : initialVendorSignupData;
  });

  const [businessData, setBusinessData] = useState<BusinessData>(() => {
    const stored = localStorage.getItem('businessData');
    return stored ? JSON.parse(stored) : initialBusinessData;
  });

  const [bookingData, setBookingData] = useState<BookingData>(() => {
    const stored = localStorage.getItem('bookingData');
    return stored ? JSON.parse(stored) : initialBookingData;
  });

  const [guestData, setGuestData] = useState<GuestData>(() => {
    const stored = localStorage.getItem('guestData');
    return stored ? JSON.parse(stored) : initialGuestData;
  });

  // Clean up old vulnerable localStorage keys on mount
  useEffect(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasCompletedSignup');
  }, []);

  // Persist signup flow data to localStorage
  useEffect(() => {
    localStorage.setItem('hostSignupData', JSON.stringify(hostSignupData));
  }, [hostSignupData]);

  useEffect(() => {
    localStorage.setItem('propertyData', JSON.stringify(propertyData));
  }, [propertyData]);

  useEffect(() => {
    localStorage.setItem('vendorSignupData', JSON.stringify(vendorSignupData));
  }, [vendorSignupData]);

  useEffect(() => {
    localStorage.setItem('businessData', JSON.stringify(businessData));
  }, [businessData]);

  useEffect(() => {
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
  }, [bookingData]);

  useEffect(() => {
    localStorage.setItem('guestData', JSON.stringify(guestData));
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
    localStorage.removeItem('hostSignupData');
    localStorage.removeItem('propertyData');
    localStorage.removeItem('vendorSignupData');
    localStorage.removeItem('businessData');
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
