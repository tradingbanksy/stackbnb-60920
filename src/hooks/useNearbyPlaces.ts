import { useState, useCallback } from 'react';
import { 
  fetchNearbyPlaces, 
  reverseGeocode, 
  geocodeLocation,
  searchRestaurantsByName,
  type GeoapifyPlace 
} from '@/services/geoapifyService';
import { toast } from '@/hooks/use-toast';

interface UseNearbyPlacesResult {
  places: GeoapifyPlace[];
  isLoading: boolean;
  error: string | null;
  userLocation: { lat: number; lng: number; city: string; zipCode: string } | null;
  detectLocation: () => void;
  searchByLocation: (query: string) => Promise<void>;
  searchByName: (query: string, lat: number, lng: number) => Promise<void>;
  setPlacesFromSelection: (places: GeoapifyPlace[]) => void;
  isLocationLoading: boolean;
}

export const useNearbyPlaces = (): UseNearbyPlacesResult => {
  const [places, setPlaces] = useState<GeoapifyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ 
    lat: number; 
    lng: number; 
    city: string; 
    zipCode: string;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Fetch places when we have coordinates
  const fetchPlaces = useCallback(async (lat: number, lng: number, radius: number = 10000) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nearbyPlaces = await fetchNearbyPlaces(lat, lng, radius, 20);
      setPlaces(nearbyPlaces);
      
      if (nearbyPlaces.length === 0) {
        toast({ 
          title: "No restaurants found nearby", 
          description: "Try searching for a different location",
          duration: 3000 
        });
      }
    } catch (err) {
      setError('Failed to fetch nearby places');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Detect user's current location
  const detectLocation = useCallback(() => {
    setIsLocationLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      toast({ 
        title: "Geolocation not supported", 
        variant: "destructive", 
        duration: 3000 
      });
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get city name
        const locationInfo = await reverseGeocode(latitude, longitude);
        
        const newLocation = {
          lat: latitude,
          lng: longitude,
          city: locationInfo?.city || 'Your Location',
          zipCode: locationInfo?.zipCode || '',
        };
        
        setUserLocation(newLocation);
        toast({ 
          title: `Location detected: ${newLocation.city}`, 
          duration: 2000 
        });
        
        // Fetch nearby places
        await fetchPlaces(latitude, longitude);
        setIsLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = "Could not detect location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied";
        } else if (error.code === error.TIMEOUT) {
          message = "Location detection timed out";
        }
        toast({ 
          title: message, 
          description: "Please enter your city or ZIP code manually",
          duration: 3000 
        });
        setError(message);
        setIsLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [fetchPlaces]);

  // Search by city name or ZIP code
  const searchByLocation = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLocationLoading(true);
    setError(null);

    try {
      const locationData = await geocodeLocation(query);
      
      if (locationData) {
        setUserLocation(locationData);
        toast({ 
          title: `Showing restaurants in ${locationData.city}`, 
          duration: 2000 
        });
        await fetchPlaces(locationData.lat, locationData.lng);
      } else {
        toast({ 
          title: "Location not found", 
          description: "Try entering a different city or ZIP code",
          variant: "destructive",
          duration: 3000 
        });
      }
    } catch (err) {
      setError('Failed to search location');
      console.error(err);
    } finally {
      setIsLocationLoading(false);
    }
  }, [fetchPlaces]);

  // Search restaurants by name within a location
  const searchByName = useCallback(async (query: string, lat: number, lng: number) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchRestaurantsByName(query, lat, lng);
      setPlaces(results);
      
      if (results.length === 0) {
        toast({ 
          title: `No results for "${query}"`, 
          description: "Try a different search term",
          duration: 3000 
        });
      } else {
        toast({ 
          title: `Found ${results.length} results for "${query}"`, 
          duration: 2000 
        });
      }
    } catch (err) {
      setError('Failed to search restaurants');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set places from external selection (e.g., autocomplete)
  const setPlacesFromSelection = useCallback((newPlaces: GeoapifyPlace[]) => {
    setPlaces(newPlaces);
  }, []);

  return {
    places,
    isLoading,
    error,
    userLocation,
    detectLocation,
    searchByLocation,
    searchByName,
    setPlacesFromSelection,
    isLocationLoading,
  };
};
