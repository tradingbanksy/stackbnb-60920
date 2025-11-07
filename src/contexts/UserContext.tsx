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

type UserRole = 'host' | 'vendor' | null;

interface UserContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
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
  completeSignup: (role: UserRole) => void;
  logout: () => void;
  hasCompletedSignup: boolean;
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('isLoggedIn');
    return stored === 'true';
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const stored = localStorage.getItem('userRole');
    return (stored as UserRole) || null;
  });

  const [hasCompletedSignup, setHasCompletedSignup] = useState<boolean>(() => {
    const stored = localStorage.getItem('hasCompletedSignup');
    return stored === 'true';
  });

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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('userRole', userRole || '');
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('hasCompletedSignup', String(hasCompletedSignup));
  }, [hasCompletedSignup]);

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

  const completeSignup = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setHasCompletedSignup(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setHasCompletedSignup(false);
    setHostSignupData(initialHostSignupData);
    setPropertyData(initialPropertyData);
    setVendorSignupData(initialVendorSignupData);
    setBusinessData(initialBusinessData);
    // Don't clear booking/guest data on logout
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasCompletedSignup');
    localStorage.removeItem('hostSignupData');
    localStorage.removeItem('propertyData');
    localStorage.removeItem('vendorSignupData');
    localStorage.removeItem('businessData');
  };

  return (
    <UserContext.Provider 
      value={{ 
        isLoggedIn,
        userRole,
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
        completeSignup,
        logout,
        hasCompletedSignup
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
