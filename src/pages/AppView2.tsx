import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Heart, User, Search, Star, Sparkles, Store, ChevronRight, Megaphone, Monitor } from "lucide-react";
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

const AppView2 = () => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        
        {/* Hero Section - Compact Mobile */}
        <div className="relative flex-shrink-0">
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
            <div className="flex items-center gap-1.5">
              <img src={stackdLogo} alt="stackd" className="h-8 w-8" />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                stackd
              </span>
            </div>
            <Link
              to="/trip-planner"
              className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white"
            >
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-4 pb-4 pt-2 text-center">
            <h1 className="text-xl font-bold text-foreground mb-1">
              Discover Experiences
            </h1>
            <p className="text-xs text-muted-foreground mb-3">
              Find amazing restaurants & adventures nearby
            </p>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
              <div className="relative bg-card/90 rounded-full border border-border/50 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center px-3 py-2 gap-2">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent text-sm h-7 shadow-none focus-visible:ring-0 px-0"
                  />
                  <button className="bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full p-1.5 flex-shrink-0">
                    <Search className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
          <div className="px-3 py-3 space-y-5">
            
            {/* Category Filters - Horizontal Scroll */}
            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
              <div className="flex gap-2 w-max">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap
                      transition-all duration-200 active:scale-95
                      ${
                        selectedCategory === category.id
                          ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md"
                          : "bg-card border border-border/50"
                      }
                    `}
                  >
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

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

            {/* All Experiences Grid - 2 columns */}
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">All Experiences</h2>
              <div className="grid grid-cols-2 gap-3">
                {filteredExperiences.slice(0, 8).map((experience) => (
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
                        <Heart
                          className={`h-4 w-4 drop-shadow-md ${
                            favorites.includes(experience.id)
                              ? "fill-red-500 text-red-500"
                              : "fill-black/40 text-white"
                          }`}
                        />
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
              {filteredExperiences.length > 8 && (
                <Link 
                  to="/experiences" 
                  className="block w-full py-2 text-center text-xs text-primary font-medium"
                >
                  View all {filteredExperiences.length} experiences
                </Link>
              )}
            </section>

            {/* Services Section */}
            <section className="space-y-3 pt-2 border-t border-border">
              <div className="text-center">
                <img src={stackdLogo} alt="stackd" className="h-16 w-16 mx-auto" />
                <h2 className="text-sm font-semibold mt-2">Our Services</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">For Customers</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Discover and book amazing local experiences
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
                      Organize affiliate relationships effortlessly
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
                      Promote your affiliate programs
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer spacer for bottom nav */}
            <div className="h-4" />
          </div>
        </div>

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
              to="/?view=browser"
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

export default AppView2;
