// Google Maps / Places API Service
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface GeoapifyPlace {
  id: string;
  name: string;
  cuisine?: string;
  address: string;
  city: string;
  zipCode: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  lat: number;
  lng: number;
  distance?: number;
  categories: string[];
  rating?: number;
  reviewCount?: number;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  photos: string[];
}

export interface AutocompleteSuggestion {
  id: string;
  type: 'restaurant' | 'location';
  name: string;
  description: string;
  lat?: number;
  lng?: number;
  city?: string;
  zipCode?: string;
  cuisine?: string;
  address?: string;
}

// Map Google place types to cuisine
const getCuisineFromTypes = (types: string[]): string => {
  const cuisineMap: Record<string, string> = {
    'italian_restaurant': 'Italian',
    'mexican_restaurant': 'Mexican',
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'indian_restaurant': 'Indian',
    'thai_restaurant': 'Thai',
    'american_restaurant': 'American',
    'french_restaurant': 'French',
    'seafood_restaurant': 'Seafood',
    'pizza_restaurant': 'Pizza',
    'hamburger_restaurant': 'Burgers',
    'sushi_restaurant': 'Japanese',
    'steak_house': 'Steakhouse',
    'mediterranean_restaurant': 'Mediterranean',
    'asian_restaurant': 'Asian',
    'cafe': 'Café',
    'fast_food_restaurant': 'Fast Food',
    'bar': 'Bar & Grill',
  };

  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type];
    }
  }
  
  return 'Restaurant';
};

// Map price level to symbol
const getPriceRange = (priceLevel?: number): '$' | '$$' | '$$$' | '$$$$' | undefined => {
  if (priceLevel === undefined) return undefined;
  const levels: ('$' | '$$' | '$$$' | '$$$$')[] = ['$', '$$', '$$$', '$$$$'];
  return levels[Math.min(priceLevel, 3)];
};

// Generate placeholder photos
const getPlaceholderPhotos = (cuisine: string): string[] => {
  const photoSets: Record<string, string[]> = {
    'Italian': [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
    ],
    'Japanese': [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    ],
    'Mexican': [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800',
    ],
    'Seafood': [
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    ],
    'American': [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    ],
    'default': [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    ],
  };
  
  return photoSets[cuisine] || photoSets['default'];
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
};

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Fetch nearby places using Google Places Nearby Search
export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  radius: number = 5000,
  limit: number = 20
): Promise<GeoapifyPlace[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API status:', data.status);
      return [];
    }
    
    return (data.results || []).slice(0, limit).map((place: {
      place_id: string;
      name: string;
      types?: string[];
      vicinity?: string;
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
      rating?: number;
      user_ratings_total?: number;
      price_level?: number;
      formatted_phone_number?: string;
      website?: string;
      opening_hours?: { weekday_text?: string[] };
    }) => {
      const types = place.types || [];
      const cuisine = getCuisineFromTypes(types);
      const placeLat = place.geometry?.location?.lat || lat;
      const placeLng = place.geometry?.location?.lng || lng;
      
      return {
        id: `gm_${place.place_id}`,
        name: place.name || 'Unknown Restaurant',
        cuisine,
        address: place.vicinity || place.formatted_address || 'Address unavailable',
        city: '',
        zipCode: '',
        phone: place.formatted_phone_number,
        website: place.website,
        openingHours: place.opening_hours?.weekday_text,
        lat: placeLat,
        lng: placeLng,
        distance: calculateDistance(lat, lng, placeLat, placeLng),
        categories: types,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        priceRange: getPriceRange(place.price_level),
        photos: getPlaceholderPhotos(cuisine),
      };
    });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
};

// Reverse geocode coordinates to get city/location name
export const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; zipCode: string } | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }
    
    const result = data.results[0];
    let city = '';
    let zipCode = '';
    
    for (const component of result.address_components || []) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('sublocality') && !city) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1') && !city) {
        city = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    }
    
    return { city: city || 'Unknown', zipCode };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Geocode a city/address to get coordinates
export const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number; city: string; zipCode: string } | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }
    
    const result = data.results[0];
    const location = result.geometry?.location;
    
    let city = '';
    let zipCode = '';
    
    for (const component of result.address_components || []) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1') && !city) {
        city = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    }
    
    return {
      lat: location?.lat || 0,
      lng: location?.lng || 0,
      city: city || query,
      zipCode,
    };
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Search for places by text query
export const searchPlaces = async (
  query: string,
  lat?: number,
  lng?: number
): Promise<GeoapifyPlace[]> => {
  try {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurant')}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (lat && lng) {
      url += `&location=${lat},${lng}&radius=25000`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return [];
    }
    
    return (data.results || []).slice(0, 10).map((place: {
      place_id: string;
      name: string;
      types?: string[];
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
      rating?: number;
      user_ratings_total?: number;
      price_level?: number;
    }) => {
      const types = place.types || [];
      const cuisine = getCuisineFromTypes(types);
      const placeLat = place.geometry?.location?.lat || 0;
      const placeLng = place.geometry?.location?.lng || 0;
      
      return {
        id: `gm_${place.place_id}`,
        name: place.name || 'Unknown Restaurant',
        cuisine,
        address: place.formatted_address || 'Address unavailable',
        city: '',
        zipCode: '',
        lat: placeLat,
        lng: placeLng,
        distance: lat && lng ? calculateDistance(lat, lng, placeLat, placeLng) : undefined,
        categories: types,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        priceRange: getPriceRange(place.price_level),
        photos: getPlaceholderPhotos(cuisine),
      };
    });
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

// Autocomplete search for restaurants and locations
export const autocompleteSearch = async (
  query: string,
  lat?: number,
  lng?: number
): Promise<AutocompleteSuggestion[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const suggestions: AutocompleteSuggestion[] = [];
    
    // Search for restaurants if we have location
    if (lat && lng) {
      const restaurantUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&location=${lat},${lng}&radius=50000&key=${GOOGLE_MAPS_API_KEY}`;
      
      try {
        const res = await fetch(restaurantUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK') {
            const restaurantSuggestions: AutocompleteSuggestion[] = (data.results || []).slice(0, 5).map((place: {
              place_id: string;
              name: string;
              types?: string[];
              formatted_address?: string;
              geometry?: { location?: { lat: number; lng: number } };
            }) => {
              const types = place.types || [];
              const cuisine = getCuisineFromTypes(types);
              
              return {
                id: `rest_${place.place_id}`,
                type: 'restaurant' as const,
                name: place.name || 'Unknown Restaurant',
                description: place.formatted_address || '',
                lat: place.geometry?.location?.lat,
                lng: place.geometry?.location?.lng,
                cuisine,
                address: place.formatted_address,
              };
            });
            suggestions.push(...restaurantSuggestions);
          }
        }
      } catch (err) {
        console.error('Restaurant search error:', err);
      }
    }
    
    // Search for locations (cities, addresses)
    const locationUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const res = await fetch(locationUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK') {
          const locationSuggestions: AutocompleteSuggestion[] = (data.predictions || []).slice(0, 5).map((prediction: {
            place_id: string;
            structured_formatting?: { main_text?: string; secondary_text?: string };
            description?: string;
          }) => ({
            id: `loc_${prediction.place_id}`,
            type: 'location' as const,
            name: prediction.structured_formatting?.main_text || prediction.description || '',
            description: prediction.structured_formatting?.secondary_text || '',
          }));
          suggestions.push(...locationSuggestions);
        }
      }
    } catch (err) {
      console.error('Location search error:', err);
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error in autocomplete search:', error);
    return [];
  }
};

// Search restaurants by name in a specific area
export const searchRestaurantsByName = async (
  query: string,
  lat: number,
  lng: number,
  radius: number = 25000
): Promise<GeoapifyPlace[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return [];
    }
    
    return (data.results || []).slice(0, 20).map((place: {
      place_id: string;
      name: string;
      types?: string[];
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
      rating?: number;
      user_ratings_total?: number;
      price_level?: number;
    }) => {
      const types = place.types || [];
      const cuisine = getCuisineFromTypes(types);
      const placeLat = place.geometry?.location?.lat || lat;
      const placeLng = place.geometry?.location?.lng || lng;
      
      return {
        id: `gm_${place.place_id}`,
        name: place.name || 'Unknown Restaurant',
        cuisine,
        address: place.formatted_address || 'Address unavailable',
        city: '',
        zipCode: '',
        lat: placeLat,
        lng: placeLng,
        distance: calculateDistance(lat, lng, placeLat, placeLng),
        categories: types,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        priceRange: getPriceRange(place.price_level),
        photos: getPlaceholderPhotos(cuisine),
      };
    });
  } catch (error) {
    console.error('Error searching restaurants by name:', error);
    return [];
  }
};
