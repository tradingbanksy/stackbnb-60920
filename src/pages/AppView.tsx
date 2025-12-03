import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, User, MessageCircle, Store, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { experiences } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import stackdLogo from "@/assets/stackd-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import kayakingImg from "@/assets/experiences/kayaking.jpg";
import bikesImg from "@/assets/experiences/bikes.jpg";
import snorkelingImg from "@/assets/experiences/snorkeling.jpg";
import photographyImg from "@/assets/experiences/photography.jpg";
import spaImg from "@/assets/experiences/spa.jpg";
import diningImg from "@/assets/experiences/dining.jpg";
import atvImg from "@/assets/experiences/atv.jpg";
import boatImg from "@/assets/experiences/boat.jpg";
import ziplineImg from "@/assets/experiences/zipline.jpg";
import horsebackImg from "@/assets/experiences/horseback.jpg";
import scubaImg from "@/assets/experiences/scuba.jpg";
import hikingImg from "@/assets/experiences/hiking.jpg";
import parasailingImg from "@/assets/experiences/parasailing.jpg";
import yogaImg from "@/assets/experiences/yoga.jpg";
import fishingImg from "@/assets/experiences/fishing.jpg";
import cookingImg from "@/assets/experiences/cooking.jpg";
import balloonImg from "@/assets/experiences/balloon.jpg";
import wineImg from "@/assets/experiences/wine.jpg";

// Restaurant components
import LocationSearch from "@/components/LocationSearch";
import RestaurantFilters, { type FilterState } from "@/components/RestaurantFilters";
import RestaurantCard from "@/components/RestaurantCard";
import { 
  mockRestaurants, 
  isRestaurantOpen, 
  filterRestaurantsByLocation,
  locationSuggestions,
  type Restaurant 
} from "@/data/mockRestaurants";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { type GeoapifyPlace, type AutocompleteSuggestion } from "@/services/geoapifyService";

const getExperienceImage = (experience: any) => {
  const imageMap: Record<number, string> = {
    1: kayakingImg,
    2: bikesImg,
    3: snorkelingImg,
    4: photographyImg,
    5: spaImg,
    6: diningImg,
    7: atvImg,
    8: boatImg,
    9: ziplineImg,
    10: horsebackImg,
    11: scubaImg,
    12: hikingImg,
    13: parasailingImg,
    14: yogaImg,
    15: fishingImg,
    16: cookingImg,
    17: balloonImg,
    18: wineImg,
  };
  return imageMap[experience.id] || kayakingImg;
};

// Convert Geoapify place to Restaurant format
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

const AppView = () => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'explore' | 'wishlists'>('explore');
  
  // Location search state
  const [searchCity, setSearchCity] = useState("");
  const [searchZip, setSearchZip] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    openNow: false,
    nearMe: false,
    topRated: false,
    priceRange: [],
    outdoorSeating: false,
  });

  // Geoapify API integration
  const { 
    places: apiPlaces, 
    isLoading: isLoadingPlaces, 
    userLocation: apiUserLocation,
    detectLocation: detectApiLocation,
    searchByLocation,
    searchByName,
    setPlacesFromSelection,
    isLocationLoading 
  } = useNearbyPlaces();

  // Selected restaurant from autocomplete
  const [selectedRestaurant, setSelectedRestaurant] = useState<AutocompleteSuggestion | null>(null);

  useEffect(() => {
    fetchMyBusinesses();
  }, []);

  const fetchMyBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vendors' as any)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMyBusinesses((data as any) || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      
      toast({
        title: prev.includes(id) ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
      
      return newFavorites;
    });
  };

  // Detect user location using Geoapify API
  const detectLocation = () => {
    detectApiLocation();
    setFilters(prev => ({ ...prev, nearMe: true }));
  };

  // Update search fields when API location changes
  useEffect(() => {
    if (apiUserLocation) {
      setSearchCity(apiUserLocation.city);
      setSearchZip(apiUserLocation.zipCode);
    }
  }, [apiUserLocation]);

  // Handle search
  const handleSearch = () => {
    const query = searchCity || searchZip;
    if (query && apiUserLocation) {
      // If we have a location, search for restaurants by name in that area
      searchByName(query, apiUserLocation.lat, apiUserLocation.lng);
    } else if (query) {
      // Otherwise search by location
      searchByLocation(query);
    }
  };

  // Handle restaurant selection from autocomplete
  const handleRestaurantSelect = (suggestion: AutocompleteSuggestion) => {
    setSelectedRestaurant(suggestion);
    if (suggestion.lat && suggestion.lng) {
      // Create a single place result for the selected restaurant
      const selectedPlace: GeoapifyPlace = {
        id: suggestion.id,
        name: suggestion.name,
        cuisine: suggestion.cuisine || 'Restaurant',
        address: suggestion.address || suggestion.description,
        city: suggestion.city || '',
        zipCode: suggestion.zipCode || '',
        lat: suggestion.lat,
        lng: suggestion.lng,
        categories: [],
        rating: 4.0 + Math.random() * 0.9,
        reviewCount: Math.floor(100 + Math.random() * 500),
        priceRange: '$$',
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
      };
      setPlacesFromSelection([selectedPlace]);
    }
  };

  // Handle location selection from autocomplete
  const handleLocationSelect = (lat: number, lng: number, city: string, zipCode: string) => {
    setSelectedRestaurant(null);
    searchByLocation(city || zipCode);
  };

  // Handle Near Me filter
  const handleNearMeClick = () => {
    if (!filters.nearMe) {
      detectLocation();
    } else {
      setFilters(prev => ({ ...prev, nearMe: false }));
    }
  };

  // Convert API places to Restaurant format
  const apiRestaurants = useMemo(() => {
    return apiPlaces.map(convertApiPlaceToRestaurant);
  }, [apiPlaces]);

  // Filter restaurants based on search and filters - use API data when available
  const filteredRestaurants = useMemo(() => {
    // If we have API results, use them; otherwise fall back to mock data
    let results: Restaurant[] = apiRestaurants.length > 0 
      ? apiRestaurants 
      : [...mockRestaurants];

    // If using mock data and searching, filter by location
    if (apiRestaurants.length === 0 && (searchCity || searchZip)) {
      results = filterRestaurantsByLocation(results, searchCity, searchZip);
    }

    // Apply filters
    if (filters.openNow && apiRestaurants.length === 0) {
      // Only filter by open status for mock data (API data doesn't have hours)
      results = results.filter(r => isRestaurantOpen(r));
    }

    if (filters.topRated) {
      results = results.filter(r => r.rating >= 4.7);
    }

    if (filters.priceRange.length > 0) {
      results = results.filter(r => filters.priceRange.includes(r.priceRange));
    }

    if (filters.outdoorSeating) {
      results = results.filter(r => r.hasOutdoorSeating);
    }

    return results;
  }, [searchCity, searchZip, filters, apiRestaurants]);

  // Get other experiences (non-dining)
  const popularExperiences = experiences.filter((exp: any) => 
    !exp.category.toLowerCase().includes('dining') && 
    !exp.category.toLowerCase().includes('food')
  ).slice(0, 10);

  // Get favorited experiences
  const favoritedExperiences = experiences.filter((exp: any) => 
    favorites.includes(exp.id)
  );

  // Active filters count
  const activeFiltersCount = [
    filters.openNow,
    filters.nearMe,
    filters.topRated,
    filters.priceRange.length > 0,
    filters.outdoorSeating
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Centered Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[450px] mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <img src={stackdLogo} alt="stackd" className="h-10 w-10 drop-shadow-lg" />
              <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                stackd
              </h1>
            </div>
            <div className="w-[88px]" /> {/* Spacer to balance the layout */}
          </div>
          
          {/* Location Search */}
          <LocationSearch
            city={searchCity}
            zipCode={searchZip}
            onCityChange={setSearchCity}
            onZipChange={setSearchZip}
            onSearch={handleSearch}
            onLocationDetect={detectLocation}
            onRestaurantSelect={handleRestaurantSelect}
            onLocationSelect={handleLocationSelect}
            isLoadingLocation={isLocationLoading}
            userLocation={apiUserLocation ? { lat: apiUserLocation.lat, lng: apiUserLocation.lng } : null}
          />
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="explore" className="max-w-[450px] mx-auto">
        <div className="sticky top-[120px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <TabsList className="w-full justify-start rounded-none bg-transparent h-12 p-0">
            <TabsTrigger 
              value="explore" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              onClick={() => setViewMode('explore')}
            >
              Explore
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Services
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              About
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="explore" className="mt-0">
          {/* Filters */}
          <RestaurantFilters
            filters={filters}
            onFilterChange={setFilters}
            onNearMeClick={handleNearMeClick}
            isLoadingLocation={isLocationLoading}
          />

          <main className="pt-2 space-y-8 pb-8">
            {viewMode === 'wishlists' ? (
              // Wishlists View
              <section className="space-y-3">
                <div className="px-4">
                  <h2 className="text-lg font-semibold">My Wishlists ({favorites.length})</h2>
                  {favorites.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No favorites yet. Heart experiences to save them here!
                    </p>
                  )}
                </div>
                {favorites.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 px-4">
                    {favoritedExperiences.map((experience: any) => (
                      <Link
                        key={experience.id}
                        to={`/experience/${experience.id}`}
                        className="group"
                      >
                        <div className="space-y-2">
                          <div className="relative aspect-square overflow-hidden rounded-xl">
                            <div
                              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                              style={{
                                backgroundImage: `url(${getExperienceImage(experience)})`,
                              }}
                            />
                            
                            <button
                              onClick={(e) => toggleFavorite(experience.id, e)}
                              className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                            >
                              <Heart className="h-5 w-5 transition-all drop-shadow-md fill-red-500 text-red-500" />
                            </button>

                            {experience.rating >= 4.8 && (
                              <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-white/95 text-foreground backdrop-blur-sm shadow-sm text-[10px] px-2 py-0.5 border-0">
                                  Guest favorite
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                              {experience.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {experience.vendor}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ★ {experience.rating} · {experience.duration}
                            </p>
                            <div className="pt-0.5">
                              <span className="text-sm font-semibold">${experience.price}</span>
                              <span className="text-xs text-muted-foreground"> per person</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              // Explore View
              <>
                {/* My Businesses Row */}
                {myBusinesses.length > 0 && (
                  <section className="space-y-3">
                    <div className="px-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">My Businesses</h2>
                      <Link to="/host/vendors" className="text-sm text-primary hover:underline">
                        View all
                      </Link>
                    </div>
                    <ScrollArea className="w-full">
                      <div className="flex gap-4 px-4 pb-2">
                        {myBusinesses.map((business) => (
                          <Link
                            key={business.id}
                            to={`/host/vendors`}
                            className="flex-shrink-0 w-[160px] group"
                          >
                            <div className="space-y-2">
                              <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-border group-hover:scale-105 transition-transform">
                                <Store className="h-12 w-12 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm line-clamp-1">{business.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">{business.category}</p>
                                <p className="text-xs text-primary">{business.commission}% commission</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </section>
                )}

                {/* Restaurants Near You */}
                <section className="space-y-3">
                  <div className="px-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Restaurants Near You</h2>
                      {(searchCity || searchZip) && (
                        <p className="text-xs text-muted-foreground">
                          {filteredRestaurants.length} results {searchCity && `in ${searchCity}`}
                        </p>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  {filteredRestaurants.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-muted-foreground">No restaurants found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your filters or search location
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-4 px-4 pb-4">
                        {filteredRestaurants.map((restaurant) => (
                          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="h-3" />
                    </ScrollArea>
                  )}
                </section>

                {/* All Restaurants (vertical list when filtered) */}
                {(searchCity || searchZip || activeFiltersCount > 0) && filteredRestaurants.length > 0 && (
                  <section className="space-y-3">
                    <div className="px-4">
                      <h2 className="text-lg font-semibold">All Results</h2>
                    </div>
                    <div className="px-2">
                      {filteredRestaurants.map((restaurant) => (
                        <RestaurantCard 
                          key={`list-${restaurant.id}`} 
                          restaurant={restaurant} 
                          variant="vertical"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Popular Experiences Row */}
                <section className="space-y-3">
                  <div className="px-4">
                    <h2 className="text-lg font-semibold">Popular Experiences</h2>
                  </div>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-4 px-4 pb-4">
                      {popularExperiences.map((experience: any) => (
                        <Link
                          key={experience.id}
                          to={`/experience/${experience.id}`}
                          className="flex-shrink-0 w-[200px] group"
                        >
                          <div className="space-y-2">
                            <div className="relative aspect-square overflow-hidden rounded-xl">
                              <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{
                                  backgroundImage: `url(${getExperienceImage(experience)})`,
                                }}
                              />
                              
                              <button
                                onClick={(e) => toggleFavorite(experience.id, e)}
                                className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                              >
                                <Heart
                                  className={`h-5 w-5 transition-all drop-shadow-md ${
                                    favorites.includes(experience.id)
                                      ? "fill-red-500 text-red-500"
                                      : "fill-black/50 text-white stroke-white stroke-2"
                                  }`}
                                />
                              </button>

                              {experience.rating >= 4.8 && (
                                <div className="absolute top-2 left-2 z-10">
                                  <Badge className="bg-white/95 text-foreground backdrop-blur-sm shadow-sm text-[10px] px-2 py-0.5 border-0">
                                    Guest favorite
                                  </Badge>
                                </div>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                                {experience.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {experience.vendor}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ★ {experience.rating} · {experience.duration}
                              </p>
                              <div className="pt-0.5">
                                <span className="text-sm font-semibold">${experience.price}</span>
                                <span className="text-xs text-muted-foreground"> per person</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-3" />
                  </ScrollArea>
                </section>
              </>
            )}
          </main>
        </TabsContent>

        <TabsContent value="services" className="mt-0">
          <div className="px-4 py-8 space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Welcome to stackd</h2>
              <p className="text-muted-foreground">The seamless experience booking platform</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">For Customers</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover and book amazing local experiences with ease. From dining to adventures, find everything you need in one place.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">For Airbnb Hosts</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize and maintain your affiliate relationships effortlessly. Track commissions and manage partnerships all in one organized dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">For Vendors</h3>
                    <p className="text-sm text-muted-foreground">
                      Get additional advertising and promote your affiliate programs to reach more customers through local Airbnb hosts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-0">
          <div className="px-4 py-8">
            <p className="text-center text-muted-foreground">About content coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 shadow-lg">
        <div className="max-w-[450px] mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => setViewMode('wishlists')}
            className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 ${
              viewMode === 'wishlists' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`h-5 w-5 ${viewMode === 'wishlists' ? 'fill-current' : ''}`} />
            <span className={`text-[10px] ${viewMode === 'wishlists' ? 'font-medium' : ''}`}>Wishlists</span>
            {favorites.length > 0 && (
              <div className="absolute top-1.5 right-1/4 h-4 w-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                {favorites.length}
              </div>
            )}
          </button>

          <Link 
            to="/trip-planner-chat"
            className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px]">AI</span>
          </Link>

          <Link 
            to="/profile"
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AppView;
