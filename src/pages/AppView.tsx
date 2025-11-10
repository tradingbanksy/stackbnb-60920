import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Heart, User, MessageCircle, Calendar, Store, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { experiences } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import stackdLogo from "@/assets/stackd-logo.png";
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

const getExperienceImage = (experience) => {
  const imageMap = {
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

const AppView = () => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);

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

  // Filter to get restaurants
  const nearbyRestaurants = experiences.filter(exp => 
    exp.category.toLowerCase().includes('dining') || 
    exp.category.toLowerCase().includes('food')
  ).slice(0, 10);

  // Get other experiences
  const popularExperiences = experiences.filter(exp => 
    !exp.category.toLowerCase().includes('dining') && 
    !exp.category.toLowerCase().includes('food')
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Centered Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[450px] mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <img src={stackdLogo} alt="stackd" className="h-10 w-10" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              stackd
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search experiences..." 
              className="pl-10 bg-background"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="explore" className="max-w-[450px] mx-auto">
        <div className="sticky top-[120px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <TabsList className="w-full justify-start rounded-none bg-transparent h-12 p-0">
            <TabsTrigger value="explore" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
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
          <main className="pt-6 space-y-8">
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

            {/* Restaurants Near You Row */}
            <section className="space-y-3">
              <div className="px-4">
                <h2 className="text-lg font-semibold">Restaurants Near You</h2>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 px-4 pb-2">
                  {nearbyRestaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      to={`/experience/${restaurant.id}`}
                      className="flex-shrink-0 w-[200px] group"
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-square overflow-hidden rounded-xl">
                          <div
                            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                            style={{
                              backgroundImage: `url(${getExperienceImage(restaurant)})`,
                            }}
                          />
                          
                          <button
                            onClick={(e) => toggleFavorite(restaurant.id, e)}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Heart
                              className={`h-5 w-5 transition-all drop-shadow-md ${
                                favorites.includes(restaurant.id)
                                  ? "fill-red-500 text-red-500"
                                  : "fill-black/50 text-white stroke-white stroke-2"
                              }`}
                            />
                          </button>

                          {restaurant.rating >= 4.8 && (
                            <div className="absolute top-2 left-2 z-10">
                              <Badge className="bg-white/95 text-foreground backdrop-blur-sm shadow-sm text-[10px] px-2 py-0.5 border-0">
                                Guest favorite
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {restaurant.vendor}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ★ {restaurant.rating} · {restaurant.duration}
                          </p>
                          <div className="pt-0.5">
                            <span className="text-sm font-semibold">${restaurant.price}</span>
                            <span className="text-xs text-muted-foreground"> per person</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>

            {/* Popular Experiences Row */}
            <section className="space-y-3">
              <div className="px-4">
                <h2 className="text-lg font-semibold">Popular Experiences</h2>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 px-4 pb-2">
                  {popularExperiences.map((experience) => (
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
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
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
          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-foreground">
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>

          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <Heart className="h-5 w-5" />
            <span className="text-[10px]">Wishlists</span>
          </Link>

          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-[10px]">Trips</span>
          </Link>

          <Link to="/appview" className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <div className="absolute top-2 right-1/4 h-2 w-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
            <span className="text-[10px]">Messages</span>
          </Link>

          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AppView;
