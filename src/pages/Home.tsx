import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User, Search, Star, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { experiences } from "@/data/mockData";
import heroImage from "@/assets/hero-beach.jpg";
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
import { toast } from "sonner";

const categories = [
  { id: "all", name: "All Experiences", icon: "✨" },
  { id: "Water Sports", name: "Water Sports", icon: "🌊" },
  { id: "Tours & Activities", name: "Tours & Activities", icon: "🗺️" },
  { id: "Transportation", name: "Transportation", icon: "🚴" },
  { id: "Food & Dining", name: "Food & Dining", icon: "🍷" },
  { id: "Wellness", name: "Wellness", icon: "💆" },
  { id: "Photography", name: "Photography", icon: "📸" },
];

// Image mapping based on experience category and name
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

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("home");
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isLoggedIn && userRole) {
      if (userRole === "host") {
        navigate("/host/dashboard");
      } else if (userRole === "vendor") {
        navigate("/vendor/dashboard");
      }
    }
  }, [isLoggedIn, userRole, navigate]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      
      toast.success(
        prev.includes(id) 
          ? "Removed from favorites" 
          : "Added to favorites"
      );
      
      return newFavorites;
    });
  };

  const filteredExperiences = experiences.filter((exp) => {
    const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App View */}
      <div className="sticky top-0 z-50 bg-background border-b">
        {/* Search Bar */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Where to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 rounded-full border-2 shadow-sm text-base"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full rounded-none h-12 bg-background border-t">
            <TabsTrigger value="home" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
              Home
            </TabsTrigger>
            <TabsTrigger value="owner" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
              Owner
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
              Vendor
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {selectedTab === "home" && (
            <>
              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-1.5 px-4 py-2 rounded-full border whitespace-nowrap text-sm
                      transition-all duration-200
                      ${
                        selectedCategory === category.id
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background border-border hover:border-foreground"
                      }
                    `}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Experiences Grid */}
              <div className="grid grid-cols-2 gap-4 pb-20">
                {filteredExperiences.map((experience) => (
                  <Link key={experience.id} to={`/experience/${experience.id}`} className="block">
                    <div className="space-y-2">
                      {/* Image with Heart */}
                      <div className="relative aspect-square overflow-hidden rounded-xl">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${getExperienceImage(experience)})`,
                          }}
                        />
                        
                        {/* Heart Button */}
                        <button
                          onClick={(e) => toggleFavorite(experience.id, e)}
                          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-all hover:scale-110 active:scale-95"
                        >
                          <Heart 
                            className={`h-5 w-5 transition-all ${
                              favorites.includes(experience.id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-700"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm line-clamp-1">{experience.name}</h3>
                        <p className="text-xs text-muted-foreground">{experience.vendor}</p>
                        
                        {/* Rating & Duration */}
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-semibold">{experience.rating}</span>
                          <span className="text-muted-foreground">({experience.reviewCount})</span>
                        </div>

                        {/* Price */}
                        <div className="pt-1">
                          <span className="font-semibold">${experience.price}</span>
                          <span className="text-muted-foreground text-xs"> / person</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {selectedTab === "owner" && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <User className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Owner Dashboard</h2>
              <p className="text-muted-foreground max-w-md">
                Sign in as a host to manage your properties and vendor partnerships.
              </p>
              <Button asChild variant="default" size="lg" className="mt-4">
                <Link to="/signup/host">Get Started as Host</Link>
              </Button>
            </div>
          )}

          {selectedTab === "vendor" && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Briefcase className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
              <p className="text-muted-foreground max-w-md">
                Sign in as a vendor to manage your services and connect with hosts.
              </p>
              <Button asChild variant="default" size="lg" className="mt-4">
                <Link to="/signup/vendor">Join as Vendor</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
