import { ArrowLeft, Sparkles, Megaphone, Users, TrendingUp, Globe, Calendar, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import stackdLogo from "@/assets/stackd-logo.png";

const ForVendors = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const features = [
    {
      icon: Megaphone,
      title: "Increased Visibility",
      description: "Get your business in front of travelers actively looking for local experiences through Airbnb host recommendations."
    },
    {
      icon: Users,
      title: "Host Network Access",
      description: "Connect with local Airbnb hosts who can promote your services directly to their guests."
    },
    {
      icon: TrendingUp,
      title: "Grow Your Bookings",
      description: "Tap into the vacation rental market and increase your customer base with qualified leads from trusted hosts."
    },
    {
      icon: Globe,
      title: "Reach More Tourists",
      description: "Access travelers from around the world who are visiting your area and looking for authentic local experiences."
    },
    {
      icon: Calendar,
      title: "Easy Booking Management",
      description: "Manage all your bookings from host referrals in one simple dashboard. No complicated integrations required."
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Collect reviews and ratings from satisfied customers to build trust and attract more bookings."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={stackdLogo} alt="stackd" className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              stackd
            </span>
          </Link>
          <div className="w-9" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">For Vendors</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get additional advertising and promote your affiliate programs to reach more customers through local Airbnb hosts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              asChild
            >
              <Link to="/signup/vendor">Get Started as Vendor</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Vendors Choose stackd</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border space-y-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create Your Vendor Profile</h3>
                <p className="text-muted-foreground">Sign up and showcase your business with photos, descriptions, pricing, and availability.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Set Your Commission Rate</h3>
                <p className="text-muted-foreground">Define the affiliate commission you'll offer hosts who bring you customers. Competitive rates attract more partners.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Discovered by Hosts</h3>
                <p className="text-muted-foreground">Local Airbnb hosts browse and add you to their recommended vendors list, exposing you to their guests.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Receive Bookings & Grow</h3>
                <p className="text-muted-foreground">Travelers book your experiences directly. Fulfill bookings, collect reviews, and watch your business grow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Perfect for All Experience Types</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Restaurants", "Tour Guides", "Adventure Sports", "Spa & Wellness",
              "Photography", "Cooking Classes", "Wine Tours", "Water Sports",
              "Hiking Tours", "Art Workshops", "Nightlife", "Transportation"
            ].map((type) => (
              <span 
                key={type} 
                className="px-4 py-2 bg-card rounded-full border border-border text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Grow Your Business?</h2>
          <p className="text-muted-foreground">
            Join the stackd vendor network and start reaching travelers through trusted Airbnb host recommendations.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            asChild
          >
            <Link to="/signup/vendor">Create Your Vendor Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ForVendors;
