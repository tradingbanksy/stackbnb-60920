import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, User, Search, Star, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { experiences } from "@/data/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-beach.jpg";
import stackdLogo from "@/assets/stackd-logo.png";
import MinimalDock from "@/components/ui/minimal-dock";
import { Footerdemo } from "@/components/ui/footer-section";
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
  const { isAuthenticated, role } = useAuthContext();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

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

  // Redirect mobile users to app view
  useEffect(() => {
    if (isMobile) {
      navigate("/appview", { replace: true });
    }
  }, [isMobile, navigate]);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "host") {
        navigate("/host/dashboard");
      } else if (role === "vendor") {
        navigate("/vendor/dashboard");
      }
    }
  }, [isAuthenticated, role, navigate]);

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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-top opacity-40"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background/70" />

        {/* Theme Toggle - Top Left */}
        <div className="absolute top-4 left-4 z-50">
          <ThemeToggle />
        </div>

        {/* Minimal Dock - Top Right */}
        <div className="absolute top-4 right-4 z-50">
          <MinimalDock />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <img src={stackdLogo} alt="stackd logo" className="h-14 w-14 sm:h-16 sm:w-16" />
              <h1 className="text-5xl sm:text-6xl font-bold font-display bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                stackd
              </h1>
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Stack your earnings through local partnerships
            </h2>

            <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
              A smarter way for hosts to partner locally, grow revenue, and streamline guest bookings.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <Link 
                  to="/signup/host"
                  className="relative flex items-center bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border/50 shadow-md hover:bg-card hover:shadow-lg transition-all duration-300 text-foreground font-medium"
                >
                  Get Started as Host
                </Link>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <Link 
                  to="/signup/vendor"
                  className="relative flex items-center bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border/50 shadow-md hover:bg-card hover:shadow-lg transition-all duration-300 text-foreground font-medium"
                >
                  I'm a Vendor
                </Link>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <Link 
                  to="/appview"
                  className="relative flex items-center bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border/50 shadow-md hover:bg-card hover:shadow-lg transition-all duration-300 text-foreground font-medium"
                >
                  Preview App View
                </Link>
              </div>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Explore Experiences Section */}
      <section className="relative bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Search Box */}
          <div className="text-center space-y-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                {/* Shadow layers for 3D effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-sm opacity-20 group-hover:opacity-30 transition duration-300"></div>

                {/* Main search container */}
                <div className="relative bg-card rounded-full shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden hover:shadow-3xl transition-all duration-300">
                  <div className="flex items-center px-6 py-4 gap-3">
                    <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <Input
                      placeholder="Search experiences..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full p-3 flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 whitespace-nowrap text-sm
                  transition-all duration-300 hover:scale-105 active:scale-95 shadow-md
                  ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-lg scale-105"
                      : "bg-card hover:border-primary/50 hover:shadow-lg"
                  }
                `}
              >
                <span className="text-base">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Experiences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-12">
            {filteredExperiences.map((experience) => (
              <Link key={experience.id} to={`/experience/${experience.id}`} className="block group">
                <div className="space-y-2">
                  {/* Image - Half size */}
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{
                        backgroundImage: `url(${getExperienceImage(experience)})`,
                      }}
                    />

                    {/* Heart/Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(experience.id, e)}
                      className="absolute top-2 right-2 z-20 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Heart
                        className={`h-5 w-5 transition-all drop-shadow-md ${
                          favorites.includes(experience.id)
                            ? "fill-red-500 text-red-500"
                            : "fill-black/50 text-white stroke-white stroke-2"
                        }`}
                      />
                    </button>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{experience.name}</h3>
                    </div>

                    <p className="text-xs text-muted-foreground">{experience.vendor}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{experience.rating}</span>
                      </div>
                      <span className="text-muted-foreground">({experience.reviewCount})</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{experience.duration}</span>
                    </div>

                    {/* Price */}
                    <div className="pt-0.5">
                      <span className="text-sm font-semibold">${experience.price}</span>
                      <span className="text-muted-foreground text-xs"> per person</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footerdemo />
    </div>
  );
};

export default Home;
