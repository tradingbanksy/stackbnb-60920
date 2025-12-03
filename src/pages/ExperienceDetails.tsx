import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import stackdLogo from "@/assets/stackd-logo.png";

const ExperienceDetails = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={stackdLogo} alt="stackd logo" className="h-8 w-8 drop-shadow-lg" />
              <span className="text-xl font-bold font-display bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                stackd
              </span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/appview')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-[16/10] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
                alt="Sunset Kayak Tour"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Vendor */}
            <div>
              <h1 className="text-4xl font-bold mb-3">Sunset Kayak Tour</h1>
              <p className="text-xl text-muted-foreground mb-4">by Ocean Adventures</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <Badge variant="secondary" className="flex items-center gap-1 px-4 py-2">
                  <Clock className="h-4 w-4" />
                  2 hours
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-4 py-2">
                  <Users className="h-4 w-4" />
                  Max 6 people
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1 px-4 py-2">
                  <Star className="h-4 w-4 fill-secondary" />
                  4.9 Rating
                </Badge>
              </div>
            </div>

            {/* About */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">About This Experience</h2>
              <p className="text-muted-foreground leading-relaxed">
                Experience the magic of a Miami Beach sunset from the water! This guided kayak tour takes you 
                through calm waters with breathtaking views. Perfect for all skill levels, our experienced guides 
                will ensure you have a safe and memorable adventure as the sun paints the sky in brilliant colors.
              </p>
            </div>

            {/* What's Included */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">What's Included</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Professional guide with local knowledge</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>All equipment including kayak, paddle, and life vest</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Safety briefing and instruction</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Waterproof phone case</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price per person</p>
                  <p className="text-4xl font-bold text-primary">$80.00</p>
                </div>

                <Button asChild size="lg" className="w-full">
                  <Link to="/booking/sunset-kayak">Book Now</Link>
                </Button>

                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Free cancellation up to 24 hours
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Instant confirmation
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Recommended by your host
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;
