import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import RestaurantFilters, { type FilterState } from "@/components/RestaurantFilters";
import RestaurantCard from "@/components/RestaurantCard";
import LocationSearch from "@/components/LocationSearch";
import stackdLogo from "@/assets/stackd-logo-new.png";
import { 
  mockRestaurants, 
  isRestaurantOpen, 
  filterRestaurantsByLocation,
  type Restaurant 
} from "@/data/mockRestaurants";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { type GeoapifyPlace, type AutocompleteSuggestion } from "@/services/geoapifyService";

const convertApiPlaceToRestaurant = (place: GeoapifyPlace): Restaurant => ({
  id: place.id,
  name: place.name,
  cuisine: place.cuisine || 'Restaurant',
  rating: place.rating || 4.0,
  reviewCount: place.reviewCount || 0,
  priceRange: place.priceRange || '$$',
  address: place.address,
  neighborhood: place.city,
  city: place.city,
  zipCode: place.zipCode,
  phone: place.phone || '',
  website: place.website,
  hours: {},
  description: `${place.name} located at ${place.address}`,
  photos: place.photos.length > 0 ? place.photos : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
  features: [],
  hasOutdoorSeating: false,
  coordinates: { lat: place.lat, lng: place.lng },
  distance: place.distance,
  isFromApi: true,
});

const AllRestaurants = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    openNow: false,
    nearMe: false,
    topRated: false,
    priceRange: [],
    outdoorSeating: false,
  });

  const { 
    places: apiPlaces, 
    isLoading: isLoadingPlaces, 
    userLocation: apiUserLocation,
    detectLocation: detectApiLocation,
    searchByLocation,
    setPlacesFromSelection,
    isLocationLoading 
  } = useNearbyPlaces();

  const handleSearch = () => {
    const query = searchCity || searchZip;
    if (query) {
      searchByLocation(query);
    }
  };

  const handleRestaurantSelect = (suggestion: AutocompleteSuggestion) => {
    // Convert AutocompleteSuggestion to GeoapifyPlace format
    const place: GeoapifyPlace = {
      id: suggestion.id,
      name: suggestion.name,
      cuisine: suggestion.cuisine,
      address: suggestion.description || '',
      city: suggestion.city || '',
      zipCode: suggestion.zipCode || '',
      lat: suggestion.lat || 0,
      lng: suggestion.lng || 0,
      categories: [],
      photos: [],
    };
    setPlacesFromSelection([place]);
  };

  const handleLocationSelect = (lat: number, lng: number, city: string, zipCode: string) => {
    setSearchCity(city);
    setSearchZip(zipCode);
    const query = city || zipCode;
    if (query) {
      searchByLocation(query);
    }
  };

  const handleNearMeClick = () => {
    if (!filters.nearMe) {
      detectApiLocation();
    }
    setFilters({ ...filters, nearMe: !filters.nearMe });
  };

  const filteredRestaurants = useMemo(() => {
    let restaurants: Restaurant[] = [];
    
    if (apiPlaces.length > 0) {
      restaurants = apiPlaces.map(convertApiPlaceToRestaurant);
    } else if (searchCity || searchZip) {
      restaurants = filterRestaurantsByLocation(mockRestaurants, searchCity, searchZip);
    } else {
      restaurants = mockRestaurants;
    }

    if (filters.openNow) {
      restaurants = restaurants.filter(r => isRestaurantOpen(r));
    }
    if (filters.topRated) {
      restaurants = restaurants.filter(r => r.rating >= 4.5);
    }
    if (filters.priceRange.length > 0) {
      restaurants = restaurants.filter(r => filters.priceRange.includes(r.priceRange as any));
    }
    if (filters.outdoorSeating) {
      restaurants = restaurants.filter(r => r.hasOutdoorSeating);
    }
    if (filters.nearMe && apiUserLocation) {
      restaurants = [...restaurants].sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return restaurants;
  }, [apiPlaces, searchCity, searchZip, filters, apiUserLocation]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/appview');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-accent rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/appview" className="flex items-center gap-2">
            <img src={stackdLogo} alt="stackd" className="h-8 w-8" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <h1 className="text-2xl font-bold">Restaurants Near You</h1>
        
        <LocationSearch
          city={searchCity}
          zipCode={searchZip}
          onCityChange={setSearchCity}
          onZipChange={setSearchZip}
          onSearch={handleSearch}
          onLocationDetect={detectApiLocation}
          onRestaurantSelect={handleRestaurantSelect}
          onLocationSelect={handleLocationSelect}
          isLoadingLocation={isLocationLoading}
          userLocation={apiUserLocation}
        />

        <RestaurantFilters 
          filters={filters} 
          onFilterChange={setFilters} 
          onNearMeClick={handleNearMeClick}
          isLoadingLocation={isLocationLoading}
        />

        {isLoadingPlaces ? (
          <div className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Finding restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No restaurants found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search location
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} variant="grid" size="small" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRestaurants;
