import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Vendor } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Heart, User, Search, Star, Sparkles, Store, ChevronRight, ChevronDown, Megaphone, Monitor, MapPin, CalendarDays, LogIn, UserPlus, CheckCircle, DollarSign, Zap, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { experiences } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import stackdLogo from "@/assets/stackd-logo-new.png";
import heroImage from "@/assets/hero-beach.jpg";
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
import RestaurantCard from "@/components/RestaurantCard";
import { mockRestaurants, type Restaurant } from "@/data/mockRestaurants";

const categories = [
  { id: "all", name: "All", icon: "✨" },
  { id: "Water Sports", name: "Water", icon: "🌊" },
  { id: "Tours & Activities", name: "Tours", icon: "🗺️" },
  { id: "Transportation", name: "Transport", icon: "🚴" },
  { id: "Food & Dining", name: "Food", icon: "🍷" },
  { id: "Wellness", name: "Wellness", icon: "💆" },
  { id: "Photography", name: "Photo", icon: "📸" },
];

const getExperienceImage = (experience: { id: number }) => {
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

interface VendorProfile {
  id: string;
  name: string;
  category: string;
  description: string | null;
  photos: string[] | null;
  price_per_person: number | null;
  google_rating: number | null;
  is_published: boolean | null;
  listing_type: 'restaurant' | 'experience';
}

const AppView = () => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [vendorFavorites, setVendorFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("vendorFavorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [myBusinesses, setMyBusinesses] = useState<Vendor[]>([]);
  const [vendorRestaurants, setVendorRestaurants] = useState<VendorProfile[]>([]);
  const [vendorExperiences, setVendorExperiences] = useState<VendorProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchMyBusinesses();
    fetchPublishedVendors();
  }, []);

  const fetchMyBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMyBusinesses((data as Vendor[]) || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchPublishedVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id, name, category, description, photos, price_per_person, google_rating, is_published, listing_type')
        .eq('is_published', true);

      if (error) throw error;
      
      const vendors = (data as VendorProfile[]) || [];
      setVendorRestaurants(vendors.filter(v => v.listing_type === 'restaurant'));
      setVendorExperiences(vendors.filter(v => v.listing_type === 'experience'));
    } catch (error) {
      console.error('Error fetching published vendors:', error);
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

  const toggleVendorFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVendorFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      
      localStorage.setItem("vendorFavorites", JSON.stringify(newFavorites));
      
      toast({
        title: prev.includes(id) ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
      
      return newFavorites;
    });
  };

  // Filter experiences
  const filteredExperiences = experiences.filter((exp) => {
    const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get restaurants
  const restaurants = mockRestaurants.slice(0, 8);

  // Get popular experiences (non-dining)
  const popularExperiences = experiences.filter((exp: any) => 
    !exp.category.toLowerCase().includes('dining') && 
    !exp.category.toLowerCase().includes('food')
  ).slice(0, 10);

  return (
    <div className="min-h-screen h-screen w-screen bg-background flex justify-center overflow-hidden">
      {/* Phone Container - Centered & Constrained */}
      <div className="w-full max-w-[430px] h-full flex flex-col bg-background overflow-hidden relative">
        
        <Tabs defaultValue="explore" className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky Tabs Header */}
          <div className="flex-shrink-0 sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-10 p-0">
              <TabsTrigger 
                value="explore" 
                className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Explore
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Services
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                About
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explore" className="flex-1 overflow-y-auto overflow-x-hidden pb-20 mt-0">
            {/* Hero Section - Now scrollable */}
            <div className="relative">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${heroImage})`,
                  filter: 'blur(1px)',
                }}
              />
              <div className="absolute inset-0 bg-background/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 rounded-full bg-background/80 border border-border text-foreground hover:bg-accent transition-colors">
                      <User className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link to="/auth" className="flex items-center gap-2 cursor-pointer">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/auth?signup=true" className="flex items-center gap-2 cursor-pointer">
                          <UserPlus className="h-4 w-4" />
                          Sign Up
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link
                    to="/trip-planner"
                    className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Hero Content */}
              <div className="relative z-10 px-4 pb-4 pt-4 text-center">
                <img src={stackdLogo} alt="stackd" className="h-40 w-40 mx-auto mb-3" />
                <h1 className="text-xl font-bold text-foreground mb-1">
                  Discover Experiences
                </h1>
                <p className="text-xs text-muted-foreground mb-3">
                  Find amazing restaurants & adventures nearby
                </p>

                {/* Search Section - Single Bar */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
                  <div className="relative bg-card/90 rounded-full border border-border/50 backdrop-blur-sm flex items-center px-3 py-2 gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <Input
                      placeholder="Where to?"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="border-0 bg-transparent text-sm h-6 shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground flex-1 min-w-0"
                    />
                    <div className="h-4 w-px bg-border/50 flex-shrink-0" />
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 min-w-[100px]">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-xs whitespace-nowrap">
                            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "When?"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setCalendarOpen(false);
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <button className="bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full p-1.5 flex-shrink-0">
                      <Search className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-3 py-3 space-y-5">

              {/* My Businesses */}
              {myBusinesses.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">My Businesses</h2>
                    <Link to="/host/vendors" className="text-xs text-primary">
                      View all
                    </Link>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                    <div className="flex gap-3 w-max">
                      {myBusinesses.map((business) => (
                        <Link
                          key={business.id}
                          to="/host/vendors"
                          className="flex-shrink-0 w-28"
                        >
                          <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-border">
                            <Store className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-xs font-medium mt-1 line-clamp-1">{business.name}</p>
                          <p className="text-[10px] text-muted-foreground">{business.category}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Restaurants Near You */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Restaurants Near You</h2>
                  <Link to="/restaurants" className="flex items-center text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                  <div className="flex gap-3 w-max pb-2">
                    {/* Vendor restaurants first */}
                    {vendorRestaurants.map((vendor) => (
                      <Link
                        key={vendor.id}
                        to={`/vendor/${vendor.id}`}
                        className="flex-shrink-0 w-36"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          {vendor.photos && vendor.photos.length > 0 ? (
                            <img
                              src={vendor.photos[0]}
                              alt={vendor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                              <Store className="h-8 w-8 text-white/80" />
                            </div>
                          )}
                          <button
                            onClick={(e) => toggleVendorFavorite(vendor.id, e)}
                            className="absolute top-2 right-2 z-10"
                          >
                            <Heart
                              className={`h-5 w-5 drop-shadow-md ${
                                vendorFavorites.includes(vendor.id)
                                  ? "fill-red-500 text-red-500"
                                  : "fill-black/40 text-white"
                              }`}
                            />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-1">{vendor.name}</p>
                            <div className="flex items-center gap-1 text-white/80 text-[10px]">
                              {vendor.google_rating && (
                                <>
                                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                  <span>{vendor.google_rating}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{vendor.category}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {/* Mock restaurants */}
                    {restaurants.map((restaurant) => (
                      <Link
                        key={restaurant.id}
                        to={`/restaurant/${restaurant.id}`}
                        className="flex-shrink-0 w-36"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          <img
                            src={restaurant.photos[0]}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-1">{restaurant.name}</p>
                            <div className="flex items-center gap-1 text-white/80 text-[10px]">
                              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                              <span>{restaurant.rating}</span>
                              <span>•</span>
                              <span>{restaurant.priceRange}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              {/* Popular Experiences */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Popular Experiences</h2>
                  <Link to="/experiences" className="flex items-center text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                  <div className="flex gap-3 w-max pb-2">
                    {/* Vendor experiences first */}
                    {vendorExperiences.map((vendor) => (
                      <Link
                        key={vendor.id}
                        to={`/vendor/${vendor.id}`}
                        className="flex-shrink-0 w-36"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          {vendor.photos && vendor.photos.length > 0 ? (
                            <img
                              src={vendor.photos[0]}
                              alt={vendor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                              <Store className="h-8 w-8 text-white/80" />
                            </div>
                          )}
                          <button
                            onClick={(e) => toggleVendorFavorite(vendor.id, e)}
                            className="absolute top-2 right-2 z-10"
                          >
                            <Heart
                              className={`h-5 w-5 drop-shadow-md ${
                                vendorFavorites.includes(vendor.id)
                                  ? "fill-red-500 text-red-500"
                                  : "fill-black/40 text-white"
                              }`}
                            />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-1">{vendor.name}</p>
                            <div className="flex items-center gap-1 text-white/80 text-[10px]">
                              {vendor.google_rating && (
                                <>
                                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                  <span>{vendor.google_rating}</span>
                                  <span>•</span>
                                </>
                              )}
                              {vendor.price_per_person && <span>${vendor.price_per_person}</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {/* Mock experiences */}
                    {popularExperiences.map((experience: any) => (
                      <Link
                        key={experience.id}
                        to={`/experience/${experience.id}`}
                        className="flex-shrink-0 w-36"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          <img
                            src={getExperienceImage(experience)}
                            alt={experience.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={(e) => toggleFavorite(experience.id, e)}
                            className="absolute top-2 right-2 z-10"
                          >
                            <Heart
                              className={`h-5 w-5 drop-shadow-md ${
                                favorites.includes(experience.id)
                                  ? "fill-red-500 text-red-500"
                                  : "fill-black/40 text-white"
                              }`}
                            />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-1">{experience.name}</p>
                            <div className="flex items-center gap-1 text-white/80 text-[10px]">
                              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                              <span>{experience.rating}</span>
                              <span>•</span>
                              <span>${experience.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              {/* Wishlists Section - Shows hearted experiences */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">My Wishlists</h2>
                  {favorites.length > 0 && (
                    <span className="text-xs text-muted-foreground">{favorites.length} saved</span>
                  )}
                </div>
                {favorites.length === 0 ? (
                  <div className="py-8 text-center">
                    <Heart className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">No favorites yet</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Heart experiences to save them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {experiences.filter(exp => favorites.includes(exp.id)).map((experience) => (
                      <Link key={experience.id} to={`/experience/${experience.id}`} className="block">
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          <img
                            src={getExperienceImage(experience)}
                            alt={experience.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={(e) => toggleFavorite(experience.id, e)}
                            className="absolute top-2 right-2 z-10"
                          >
                            <Heart className="h-4 w-4 drop-shadow-md fill-red-500 text-red-500" />
                          </button>
                        </div>
                        <div className="mt-1.5">
                          <p className="text-xs font-medium line-clamp-1">{experience.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{experience.vendor}</p>
                          <div className="flex items-center gap-1 text-[10px]">
                            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                            <span>{experience.rating}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">${experience.price}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* How stackd Works Section */}
              <section className="space-y-3 pt-4">
                <h2 className="text-base font-display font-bold tracking-wide">How stackd Works</h2>
                <p className="text-xs text-muted-foreground">
                  Turn your local knowledge into passive income
                </p>
                <div className="space-y-3">
                  <Card className="p-4 bg-card border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500/10 to-purple-600/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Curated Recommendations</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your personal recommendations, not algorithmic suggestions. Guests trust you, not ads.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500/10 to-purple-600/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Commission Tracking</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          See exactly what you've earned from each vendor and get metrics on which vendors are performing well for you, updated in real-time.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500/10 to-purple-600/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Easy Integration</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Paste your guidebook, we handle the rest. No technical skills required.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Transparent Pricing Section */}
              <section className="space-y-3 pt-2">
                <h2 className="text-base font-display font-bold tracking-wide">Transparent Pricing</h2>
                <p className="text-xs text-muted-foreground">
                  No hidden fees. No monthly costs. Simple.
                </p>
                <Card className="p-4 bg-card border-border/50">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">How It Works:</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">Vendors set their own commission %</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">No affiliate program? We'll help set one up</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">Guests pay regular price (no markup)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">No hidden fees. No monthly costs for hosts.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground mb-3">Example: Vendor offers 10% on a $100 tour</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Guest pays</p>
                          <p className="text-sm font-bold">$100</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-lg p-2 text-center border border-orange-500/20">
                          <p className="text-[10px] text-muted-foreground mb-0.5">You earn</p>
                          <p className="text-sm font-bold text-orange-500">$10</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Vendor gets</p>
                          <p className="text-sm font-bold">$90</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* FAQ Section */}
              <section className="space-y-3 pt-2">
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-purple-500/30 transition-all cursor-pointer group">
                      <h2 className="text-sm font-display font-bold tracking-wide">Common Questions</h2>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Accordion type="single" collapsible className="space-y-2">
                      <AccordionItem value="item-1" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          Do my guests pay more?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          No. Guests pay the vendor's regular price. Your commission comes from the vendor, not the guest.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          How do I get paid?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Automatic payouts every week via Stripe. No chasing vendors for payment.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          What if I already recommend these places?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Perfect! Now you'll get paid for recommendations you're already making for free.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          Is there a monthly fee?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          No monthly fee for hosts. stackd earns a small platform fee from vendors.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          What do vendors get?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Advertising and exposure through trusted host recommendations — the most valuable kind of marketing.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-6" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          What do guests get?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Convenience of booking highly recommended businesses in one place, curated by their host.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-7" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          I already have affiliate partnerships — can I still use stackd?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Absolutely! Keep your existing relationships and discover new ones through our platform.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CollapsibleContent>
                </Collapsible>
              </section>

              {/* Partner Links Section */}
              <section className="space-y-3">
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-purple-500/30 transition-all cursor-pointer group">
                      <h2 className="text-sm font-display font-bold tracking-wide">Partner With Us</h2>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    <Link 
                      to="/for-vendors" 
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-orange-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">For Vendors</p>
                          <p className="text-[10px] text-muted-foreground">Grow your business with stackd</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </Link>
                    <Link 
                      to="/for-hosts" 
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-orange-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Home className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">For Hosts</p>
                          <p className="text-[10px] text-muted-foreground">Monetize your recommendations</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              </section>

              {/* Footer spacer for bottom nav */}
              <div className="h-4" />
            </div>
          </TabsContent>

          <TabsContent value="services" className="flex-1 overflow-y-auto pb-20 mt-0">
            <div className="px-4 py-6 space-y-5">
              <div className="text-center">
                <img src={stackdLogo} alt="stackd" className="h-32 w-32 mx-auto" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">For Customers</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Discover and book amazing local experiences with ease. From dining to adventures, find everything you need in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">For Airbnb Hosts</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Create your profile, add vendors from our directory or your own list, and share with guests so they can book through the platform.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">For Vendors</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
717:                       Get additional advertising and promote your affiliate programs to reach more customers through local Airbnb hosts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Links Section */}
              <section className="space-y-3">
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-purple-500/30 transition-all cursor-pointer group">
                      <h2 className="text-sm font-display font-bold tracking-wide">Partner With Us</h2>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    <Link 
                      to="/for-vendors" 
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-orange-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">For Vendors</p>
                          <p className="text-[10px] text-muted-foreground">Grow your business with stackd</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </Link>
                    <Link 
                      to="/for-hosts" 
                      className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-orange-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Home className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">For Hosts</p>
                          <p className="text-[10px] text-muted-foreground">Monetize your recommendations</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              </section>

              {/* FAQ Section */}
              <section className="space-y-3">
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-purple-500/30 transition-all cursor-pointer group">
                      <h2 className="text-sm font-display font-bold tracking-wide">Common Questions</h2>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <Accordion type="single" collapsible className="space-y-2">
                      <AccordionItem value="item-1" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          Do my guests pay more?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          No. Guests pay the vendor's regular price. Your commission comes from the vendor, not the guest.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          How do I get paid?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Automatic payouts every week via Stripe. No chasing vendors for payment.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          What if I already recommend these places?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Perfect! Now you'll get paid for recommendations you're already making for free.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          Is there a monthly fee?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          No monthly fee for hosts. stackd earns a small platform fee from vendors.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          What do vendors get?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Advertising and exposure through trusted host recommendations — the most valuable kind of marketing.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-6" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          What do guests get?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Convenience of booking highly recommended businesses in one place, curated by their host.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-7" className="bg-card rounded-lg border border-border px-4">
                        <AccordionTrigger className="text-left text-xs font-semibold hover:no-underline py-3">
                          I already have affiliate partnerships — can I still use stackd?
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground pb-3">
                          Absolutely! Keep your existing relationships and discover new ones through our platform.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CollapsibleContent>
                </Collapsible>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="about" className="flex-1 overflow-y-auto pb-20 mt-0">
            <div className="px-4 py-6 space-y-6">
              {/* Logo and Tagline */}
              <div className="text-center space-y-2">
                <img src={stackdLogo} alt="stackd" className="h-32 w-32 mx-auto" />
                <p className="text-muted-foreground text-xs max-w-xs mx-auto">
                  Your one-stop platform for discovering local experiences, dining, and adventures.
                </p>
              </div>

              {/* Mission */}
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm">Our Mission</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We connect travelers with unforgettable local experiences while empowering hosts and vendors to grow their businesses through meaningful partnerships.
                </p>
              </div>

              {/* What We Offer */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">What We Offer</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Curated local restaurants and dining experiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Adventure activities and tours from trusted vendors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>AI-powered trip planning assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Seamless booking and reservation management</span>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-1.5 pt-3 border-t border-border">
                <h3 className="font-semibold text-sm">Get in Touch</h3>
                <p className="text-xs text-muted-foreground">
                  Have questions or feedback? We'd love to hear from you.
                </p>
                <p className="text-xs text-primary">support@stackd.com</p>
              </div>

              {/* Version */}
              <div className="text-center pt-3">
                <p className="text-[10px] text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Navigation - Fixed within container */}
        <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="flex justify-around items-center h-14">
            <Link
              to="/wishlists"
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground"
            >
              <Heart className="h-5 w-5" />
              <span className="text-[9px]">Wishlists</span>
              {favorites.length > 0 && (
                <div className="absolute top-1 right-1/4 h-3.5 w-3.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-[7px] text-white font-bold flex items-center justify-center">
                  {favorites.length}
                </div>
              )}
            </Link>

            <Link 
              to="/trip-planner"
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[9px]">AI</span>
            </Link>

            <Link 
              to="/profile"
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-[9px]">Profile</span>
            </Link>

            <Link 
              to="/home"
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground"
            >
              <Monitor className="h-5 w-5" />
              <span className="text-[9px]">Browser</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppView;
