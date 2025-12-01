import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { locationSuggestions } from "@/data/mockRestaurants";

interface LocationSearchProps {
  city: string;
  zipCode: string;
  onCityChange: (city: string) => void;
  onZipChange: (zip: string) => void;
  onSearch: () => void;
  onLocationDetect: () => void;
  isLoadingLocation?: boolean;
}

interface Suggestion {
  type: 'city' | 'zip';
  value: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const LocationSearch = ({
  city,
  zipCode,
  onCityChange,
  onZipChange,
  onSearch,
  onLocationDetect,
  isLoadingLocation
}: LocationSearchProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeInput, setActiveInput] = useState<'city' | 'zip' | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterSuggestions = (value: string, type: 'city' | 'zip') => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = locationSuggestions.filter(s => {
      if (type === 'city') {
        return s.type === 'city' && s.value.toLowerCase().includes(value.toLowerCase());
      } else {
        return s.type === 'zip' && s.value.startsWith(value);
      }
    }).slice(0, 5);

    setSuggestions(filtered as Suggestion[]);
    setShowSuggestions(filtered.length > 0);
  };

  const handleCityInput = (value: string) => {
    onCityChange(value);
    setActiveInput('city');
    filterSuggestions(value, 'city');
  };

  const handleZipInput = (value: string) => {
    onZipChange(value);
    setActiveInput('zip');
    filterSuggestions(value, 'zip');
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === 'city') {
      onCityChange(suggestion.value);
      if (suggestion.zipCode) onZipChange(suggestion.zipCode);
    } else {
      onZipChange(suggestion.value);
      if (suggestion.city) onCityChange(suggestion.city);
    }
    setShowSuggestions(false);
    onSearch();
  };

  const clearSearch = () => {
    onCityChange('');
    onZipChange('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch();
    }
  };

  return (
    <div ref={wrapperRef} className="relative group">
      {/* Shadow layers for 3D effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-sm opacity-20 group-hover:opacity-30 transition duration-300"></div>

      {/* Main search container */}
      <div className="relative bg-card rounded-full shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden hover:shadow-3xl transition-all duration-300">
        <div className="flex items-center px-4 py-3 gap-2">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => handleCityInput(e.target.value)}
              onFocus={() => {
                setActiveInput('city');
                filterSuggestions(city, 'city');
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground min-w-0"
            />
            <div className="h-4 w-px bg-border"></div>
            <input
              type="text"
              placeholder="Zip"
              value={zipCode}
              onChange={(e) => handleZipInput(e.target.value)}
              onFocus={() => {
                setActiveInput('zip');
                filterSuggestions(zipCode, 'zip');
              }}
              onKeyDown={handleKeyDown}
              className="w-16 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          {(city || zipCode) && (
            <button
              onClick={clearSearch}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          <button
            onClick={onLocationDetect}
            disabled={isLoadingLocation}
            className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
            title="Use my location"
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <button 
            onClick={onSearch}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full p-2 flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors"
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{suggestion.value}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.type === 'city' 
                    ? `${suggestion.state}` 
                    : `${suggestion.city}, ${suggestion.state}`
                  }
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
