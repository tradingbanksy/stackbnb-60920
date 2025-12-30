import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// SECURITY: Password fields removed from stored data - only used during form submission
export interface HostSignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PropertyData {
  propertyName: string;
  airbnbUrl: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

// SECURITY: Password fields removed from stored data - only used during form submission
export interface VendorSignupData {
  businessName: string;
  businessType: string;
  contactName: string;
  email: string;
  phone: string;
}

// SECURITY: taxId removed - should only be submitted directly to server
export interface BusinessData {
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
}

interface SignupContextType {
  hostSignupData: HostSignupData;
  propertyData: PropertyData;
  vendorSignupData: VendorSignupData;
  businessData: BusinessData;
  updateHostSignupData: (data: Partial<HostSignupData>) => void;
  updatePropertyData: (data: Partial<PropertyData>) => void;
  updateVendorSignupData: (data: Partial<VendorSignupData>) => void;
  updateBusinessData: (data: Partial<BusinessData>) => void;
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

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider = ({ children }: { children: ReactNode }) => {
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
    <SignupContext.Provider 
      value={{ 
        hostSignupData, 
        propertyData,
        vendorSignupData,
        businessData,
        updateHostSignupData, 
        updatePropertyData,
        updateVendorSignupData,
        updateBusinessData,
        clearSignupData,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
};
