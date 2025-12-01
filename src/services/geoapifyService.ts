// Geoapify Places API Service
const GEOAPIFY_API_KEY = 'ab4635ee8a9c40a7b4598a8d618a8481';

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
  distance?: number; // in meters
  categories: string[];
  rating?: number;
  reviewCount?: number;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  photos: string[];
}

interface GeoapifyResponse {
  features: Array<{
    properties: {
      place_id: string;
      name?: string;
      street?: string;
      housenumber?: string;
      city?: string;
      postcode?: string;
      formatted?: string;
      categories?: string[];
      datasource?: {
        raw?: {
          phone?: string;
          website?: string;
          opening_hours?: string;
          cuisine?: string;
          'contact:phone'?: string;
          'contact:website'?: string;
        };
      };
      distance?: number;
      lon: number;
      lat: number;
    };
  }>;
}

// Map Geoapify categories to cuisine types
const getCuisineFromCategories = (categories: string[]): string => {
  const cuisineMap: Record<string, string> = {
    'catering.restaurant.italian': 'Italian',
    'catering.restaurant.mexican': 'Mexican',
    'catering.restaurant.chinese': 'Chinese',
    'catering.restaurant.japanese': 'Japanese',
    'catering.restaurant.indian': 'Indian',
    'catering.restaurant.thai': 'Thai',
    'catering.restaurant.american': 'American',
    'catering.restaurant.french': 'French',
    'catering.restaurant.seafood': 'Seafood',
    'catering.restaurant.pizza': 'Pizza',
    'catering.restaurant.burger': 'Burgers',
    'catering.restaurant.sushi': 'Japanese',
    'catering.restaurant.steakhouse': 'Steakhouse',
    'catering.restaurant.mediterranean': 'Mediterranean',
    'catering.restaurant.asian': 'Asian',
    'catering.cafe': 'Café',
    'catering.fast_food': 'Fast Food',
    'catering.bar': 'Bar & Grill',
  };

  for (const category of categories) {
    for (const [key, value] of Object.entries(cuisineMap)) {
      if (category.includes(key.split('.').pop() || '')) {
        return value;
      }
    }
  }
  
  return 'Restaurant';
};

// Generate placeholder photos based on cuisine
const getPlaceholderPhotos = (cuisine: string, index: number): string[] => {
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

// Fetch nearby places
export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  radius: number = 5000, // 5km default
  limit: number = 20
): Promise<GeoapifyPlace[]> => {
  try {
    const categories = 'catering.restaurant,catering.cafe';
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }
    
    const data: GeoapifyResponse = await response.json();
    
    return data.features.map((feature, index) => {
      const props = feature.properties;
      const raw = props.datasource?.raw || {};
      const categories = props.categories || [];
      const cuisine = raw.cuisine || getCuisineFromCategories(categories);
      
      return {
        id: `geo_${props.place_id}`,
        name: props.name || 'Unknown Restaurant',
        cuisine,
        address: props.formatted || `${props.housenumber || ''} ${props.street || ''}`.trim() || 'Address unavailable',
        city: props.city || '',
        zipCode: props.postcode || '',
        phone: raw.phone || raw['contact:phone'] || undefined,
        website: raw.website || raw['contact:website'] || undefined,
        openingHours: raw.opening_hours ? [raw.opening_hours] : undefined,
        lat: props.lat,
        lng: props.lon,
        distance: props.distance,
        categories,
        rating: 4.0 + Math.random() * 0.9, // Geoapify doesn't provide ratings, using placeholder
        reviewCount: Math.floor(100 + Math.random() * 500), // Placeholder
        priceRange: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)] as '$' | '$$' | '$$$',
        photos: getPlaceholderPhotos(cuisine, index),
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
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      return {
        city: props.city || props.county || props.state || 'Unknown',
        zipCode: props.postcode || '',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
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
    let url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.cafe&name=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPIFY_API_KEY}`;
    
    if (lat && lng) {
      url += `&bias=proximity:${lng},${lat}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }
    
    const data: GeoapifyResponse = await response.json();
    
    return data.features.map((feature, index) => {
      const props = feature.properties;
      const raw = props.datasource?.raw || {};
      const categories = props.categories || [];
      const cuisine = raw.cuisine || getCuisineFromCategories(categories);
      
      return {
        id: `geo_${props.place_id}`,
        name: props.name || 'Unknown Restaurant',
        cuisine,
        address: props.formatted || `${props.housenumber || ''} ${props.street || ''}`.trim() || 'Address unavailable',
        city: props.city || '',
        zipCode: props.postcode || '',
        phone: raw.phone || raw['contact:phone'] || undefined,
        website: raw.website || raw['contact:website'] || undefined,
        openingHours: raw.opening_hours ? [raw.opening_hours] : undefined,
        lat: props.lat,
        lng: props.lon,
        distance: props.distance,
        categories,
        rating: 4.0 + Math.random() * 0.9,
        reviewCount: Math.floor(100 + Math.random() * 500),
        priceRange: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)] as '$' | '$$' | '$$$',
        photos: getPlaceholderPhotos(cuisine, index),
      };
    });
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

// Geocode a city/address to get coordinates
export const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number; city: string; zipCode: string } | null> => {
  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=1&apiKey=${GEOAPIFY_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      return {
        lat: props.lat,
        lng: props.lon,
        city: props.city || props.county || props.state || query,
        zipCode: props.postcode || '',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Autocomplete suggestion types
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

// Autocomplete search for restaurants and locations
export const autocompleteSearch = async (
  query: string,
  lat?: number,
  lng?: number
): Promise<AutocompleteSuggestion[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const suggestions: AutocompleteSuggestion[] = [];
    
    // Fetch restaurant suggestions
    const restaurantUrl = lat && lng
      ? `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.cafe,catering.fast_food,catering.bar&name=${encodeURIComponent(query)}&filter=circle:${lng},${lat},50000&bias=proximity:${lng},${lat}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      : `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.cafe,catering.fast_food,catering.bar&name=${encodeURIComponent(query)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`;
    
    // Fetch location suggestions  
    const locationUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&limit=3&apiKey=${GEOAPIFY_API_KEY}`;
    
    const [restaurantRes, locationRes] = await Promise.all([
      fetch(restaurantUrl),
      fetch(locationUrl)
    ]);
    
    if (restaurantRes.ok) {
      const restaurantData = await restaurantRes.json();
      const restaurantSuggestions: AutocompleteSuggestion[] = restaurantData.features?.map((feature: any) => {
        const props = feature.properties;
        const raw = props.datasource?.raw || {};
        const categories = props.categories || [];
        const cuisine = raw.cuisine || getCuisineFromCategories(categories);
        
        return {
          id: `rest_${props.place_id}`,
          type: 'restaurant' as const,
          name: props.name || 'Unknown Restaurant',
          description: props.formatted || `${props.city || ''}, ${props.state || ''}`.trim(),
          lat: props.lat,
          lng: props.lon,
          city: props.city,
          zipCode: props.postcode,
          cuisine,
          address: props.formatted,
        };
      }) || [];
      
      suggestions.push(...restaurantSuggestions);
    }
    
    if (locationRes.ok) {
      const locationData = await locationRes.json();
      const locationSuggestions: AutocompleteSuggestion[] = locationData.features?.map((feature: any) => {
        const props = feature.properties;
        return {
          id: `loc_${props.place_id}`,
          type: 'location' as const,
          name: props.city || props.name || props.formatted,
          description: `${props.state || ''}, ${props.country || ''}`.trim().replace(/^,\s*/, ''),
          lat: props.lat,
          lng: props.lon,
          city: props.city || props.name,
          zipCode: props.postcode || '',
        };
      }) || [];
      
      suggestions.push(...locationSuggestions);
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
    const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.cafe,catering.fast_food,catering.bar&name=${encodeURIComponent(query)}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }
    
    const data: GeoapifyResponse = await response.json();
    
    return data.features.map((feature, index) => {
      const props = feature.properties;
      const raw = props.datasource?.raw || {};
      const categories = props.categories || [];
      const cuisine = raw.cuisine || getCuisineFromCategories(categories);
      
      return {
        id: `geo_${props.place_id}`,
        name: props.name || 'Unknown Restaurant',
        cuisine,
        address: props.formatted || `${props.housenumber || ''} ${props.street || ''}`.trim() || 'Address unavailable',
        city: props.city || '',
        zipCode: props.postcode || '',
        phone: raw.phone || raw['contact:phone'] || undefined,
        website: raw.website || raw['contact:website'] || undefined,
        openingHours: raw.opening_hours ? [raw.opening_hours] : undefined,
        lat: props.lat,
        lng: props.lon,
        distance: props.distance,
        categories,
        rating: 4.0 + Math.random() * 0.9,
        reviewCount: Math.floor(100 + Math.random() * 500),
        priceRange: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)] as '$' | '$$' | '$$$',
        photos: getPlaceholderPhotos(cuisine, index),
      };
    });
  } catch (error) {
    console.error('Error searching restaurants by name:', error);
    return [];
  }
};
