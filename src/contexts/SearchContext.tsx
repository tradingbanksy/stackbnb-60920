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
