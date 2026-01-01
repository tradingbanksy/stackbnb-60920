import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Star, ArrowLeft, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { experiences } from "@/data/mockData";
import heroImage from "@/assets/hero-beach.jpg";
import { useState, useMemo } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import HostBottomNav from "@/components/HostBottomNav";

// Import experience images
import kayakingImg from "@/assets/experiences/kayaking.jpg";
import bikesImg from "@/assets/experiences/bikes.jpg";
import snorkelingImg from "@/assets/experiences/snorkeling.jpg";
import photographyImg from "@/assets/experiences/photography.jpg";
import spaImg from "@/assets/experiences/spa.jpg";
import wineImg from "@/assets/experiences/wine.jpg";
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
import diningImg from "@/assets/experiences/dining.jpg";

const categories = [
  { id: "all", name: "All Vendors", icon: "✨" },
  { id: "Water Sports", name: "Water Sports", icon: "🌊" },
  { id: "Transportation", name: "Transportation", icon: "🚴" },
  { id: "Food & Dining", name: "Food & Dining", icon: "🍷" },
  { id: "Wellness", name: "Wellness", icon: "💆" },
  { id: "Photography", name: "Photography", icon: "📸" },
  { id: "Tours & Activities", name: "Tours", icon: "🎯" },
];

// Image mapping for experiences
const getExperienceImage = (experienceId: number): string => {
  const imageMap: Record<number, string> = {
    1: kayakingImg,
    2: bikesImg,
    3: snorkelingImg,
    4: photographyImg,
    5: spaImg,
    6: wineImg,
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
    18: diningImg,
  };
  return imageMap[experienceId] || kayakingImg;
};

const HostVendors = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { recommendations, isLoading } = useProfile();

  // Get vendor IDs from recommendations
  const savedVendorIds = useMemo(() => {
    return recommendations
      .filter(r => r.type === 'vendor')
      .map(r => r.id);
  }, [recommendations]);

  // Filter experiences by saved vendor IDs (using vendorId from experience)
  const savedExperiences = useMemo(() => {
    return experiences.filter(exp => 
      savedVendorIds.includes(String(exp.vendorId))
    );
  }, [savedVendorIds]);

  // Apply category and search filters
  const filteredExperiences = useMemo(() => {
    let filtered = savedExperiences;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.name.toLowerCase().includes(query) ||
        exp.vendor.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [savedExperiences, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/80 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/host/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="flex items-center justify-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Vendors</h1>
          </div>
          <p className="text-muted-foreground">
            Browse vendors from Explore to add them to your list
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-sm opacity-20 group-hover:opacity-30 transition duration-300"></div>
            
            <div className="relative bg-card rounded-full shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center px-6 py-4 gap-3">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input 
                  placeholder="Search your vendors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
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
                ${selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-lg scale-105' 
                  : 'bg-card hover:border-primary/50 hover:shadow-lg'
                }
              `}
            >
              <span className="text-base">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your vendors...</p>
          </div>
        ) : savedVendorIds.length === 0 ? (
          <Card className="max-w-md mx-auto p-8 text-center bg-card/80 backdrop-blur-sm">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vendors Yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse experiences and click "Add to Vendor List" to add vendors here.
            </p>
            <Link 
              to="/explore"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:scale-105 transition-all"
            >
              Explore Vendors
            </Link>
          </Card>
        ) : filteredExperiences.length === 0 ? (
          <Card className="max-w-md mx-auto p-8 text-center bg-card/80 backdrop-blur-sm">
            <p className="text-muted-foreground">
              No vendors match your current filters.
            </p>
          </Card>
        ) : (
          /* Vendors Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-12">
            {filteredExperiences.map((experience) => (
              <Link
                key={experience.id}
                to={`/experience/${experience.id}`}
                className="block group"
              >
                <div className="space-y-2">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{ 
                        backgroundImage: `url(${getExperienceImage(experience.id)})` 
                      }}
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      <Badge variant="secondary" className="bg-white/95 text-foreground backdrop-blur-sm shadow-md text-xs px-2 py-0.5">
                        <span className="mr-0.5">{experience.categoryIcon}</span>
                      </Badge>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                        {experience.name}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {experience.vendor}
                    </p>

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
        )}
      </div>

      <HostBottomNav />
    </div>
  );
};

export default HostVendors;
