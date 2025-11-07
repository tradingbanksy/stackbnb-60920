import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, User, Search, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { experiences } from "@/data/mockData";
import heroImage from "@/assets/hero-beach.jpg";
import stackdLogo from "@/assets/stackd-logo.png";

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
    1: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop", // Sunset kayaking
    2: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop", // Beach bikes
    3: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop", // Snorkeling
    4: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&auto=format&fit=crop", // Beach photography
    5: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop", // Spa/wellness
    6: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop", // Food & wine
    7: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop", // ATV jungle
    8: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop", // Boat rental
    9: "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&auto=format&fit=crop", // Zip line
    10: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop", // Horseback riding
    11: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop", // Scuba diving
    12: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop", // Mountain hiking
  };
  return imageMap[experience.id] || imageMap[1];
};

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <img src={stackdLogo} alt="stackd logo" className="h-14 w-14 sm:h-16 sm:w-16" />
              <h1 className="text-5xl sm:text-6xl font-bold font-display bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                stackd
              </h1>
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-black max-w-4xl mx-auto leading-tight">
              Stack your earnings through local partnerships
            </h2>

            <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
              A smarter way for hosts to partner locally, grow revenue, and streamline guest bookings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Button asChild variant="gradient" size="lg">
                <Link to="/signup/host">Get Started as Host</Link>
              </Button>

              <Button asChild variant="gradient" size="lg">
                <Link to="/signup/vendor">I'm a Vendor</Link>
              </Button>
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

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      <Badge
                        variant="secondary"
                        className="bg-white/95 text-foreground backdrop-blur-sm shadow-md text-xs px-2 py-0.5"
                      >
                        <span className="mr-0.5">{experience.categoryIcon}</span>
                      </Badge>
                    </div>

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
    </div>
  );
};

export default Home;
