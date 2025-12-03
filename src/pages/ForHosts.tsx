import { ArrowLeft, Store, Users, DollarSign, BarChart3, Calendar, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import stackdLogo from "@/assets/stackd-logo.png";

const ForHosts = () => {
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
      icon: Users,
      title: "Manage Vendor Relationships",
      description: "Keep all your local vendor partnerships organized in one place. Easily add, remove, and track vendors you work with."
    },
    {
      icon: DollarSign,
      title: "Track Commissions",
      description: "Monitor your affiliate earnings in real-time. See which partnerships generate the most revenue for your business."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Get insights into booking trends, popular experiences, and guest preferences to optimize your recommendations."
    },
    {
      icon: Calendar,
      title: "Seamless Booking Integration",
      description: "Your guests can easily book experiences you recommend, creating a frictionless experience that keeps them coming back."
    },
    {
      icon: Shield,
      title: "Trusted Network",
      description: "All vendors on stackd are vetted for quality, ensuring your guests have amazing experiences every time."
    },
    {
      icon: Store,
      title: "Custom Storefront",
      description: "Create a personalized storefront showcasing your curated selection of local experiences for your guests."
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
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">For Airbnb Hosts</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize and maintain your affiliate relationships effortlessly. Track commissions and manage partnerships all in one organized dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              asChild
            >
              <Link to="/signup/host">Get Started as Host</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/host/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Hosts Love stackd</h2>
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
                <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">Sign up as a host and set up your profile with your property details and location.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect with Local Vendors</h3>
                <p className="text-muted-foreground">Browse and add trusted local vendors to your network. Build relationships that benefit your guests.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share with Your Guests</h3>
                <p className="text-muted-foreground">Share your custom storefront link with guests so they can easily book curated experiences.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Earn Commissions</h3>
                <p className="text-muted-foreground">Track bookings and earn affiliate commissions automatically for every experience booked through your storefront.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Join hundreds of Airbnb hosts who are already earning extra income by recommending amazing local experiences.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            asChild
          >
            <Link to="/signup/host">Create Your Host Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ForHosts;
