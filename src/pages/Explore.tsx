import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Search, Star, MapPin, CalendarDays, ArrowLeft, User, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { experiences } from "@/data/mockData";
import heroImage from "@/assets/hero-beach.jpg";
import stackdLogo from "@/assets/stackd-logo-new.png";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExperienceCard } from "@/components/ExperienceCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";

const categories = [
  { id: "all", name: "All", icon: "✨" },
  { id: "Water Sports", name: "Water", icon: "🌊" },
  { id: "Tours & Activities", name: "Tours", icon: "🗺️" },
  { id: "Transportation", name: "Transport", icon: "🚴" },
  { id: "Food & Dining", name: "Food", icon: "🍷" },
  { id: "Wellness", name: "Wellness", icon: "💆" },
  { id: "Photography", name: "Photo", icon: "📸" },
];

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, role } = useAuthContext();
  
  // Check if we're in host mode (came from host vendors page)
  const isHostMode = searchParams.get('mode') === 'host' || (isAuthenticated && role === 'host');

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
    <div className="min-h-screen h-screen w-screen bg-background flex justify-center overflow-hidden">
      {/* Phone Container - Centered & Constrained */}
      <div className="w-full max-w-[430px] h-full flex flex-col bg-background overflow-hidden relative">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
          {/* Hero Section */}
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
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-background/80 border border-border text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <ThemeToggle />
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
                {isHostMode ? "Explore Vendors" : "Discover Experiences"}
              </h1>
              <p className="text-xs text-muted-foreground mb-3">
                {isHostMode ? "Add vendors to your list by tapping the +" : "Find amazing experiences nearby"}
              </p>

              {/* Search Section - Single Bar */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
                <div className="relative bg-card/90 rounded-full border border-border/50 backdrop-blur-sm flex items-center px-3 py-2 gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="px-3 py-3 space-y-4">
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap text-xs
                    transition-all duration-300 
                    ${selectedCategory === category.id 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-lg' 
                      : 'bg-card hover:border-primary/50 border-border'
                    }
                  `}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Experiences - Horizontal Scroll */}
            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
              <div className="flex gap-3 w-max pb-2">
                {filteredExperiences.map((experience) => (
                  <div key={experience.id} className="flex-shrink-0 w-40">
                    <ExperienceCard 
                      experience={experience} 
                      showAddButton={isHostMode}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
