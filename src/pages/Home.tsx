import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Search, 
  Compass, 
  DollarSign, 
  ChevronRight,
  Check,
  ArrowRight,
  MapPin
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import heroImage from "@/assets/hero-beach.jpg";
import stackdLogo from "@/assets/stackd-logo-new.png";
import MinimalDock from "@/components/ui/minimal-dock";
import { Footerdemo } from "@/components/ui/footer-section";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const steps = [
  {
    icon: Sparkles,
    title: "Quick Setup (2 Minutes)",
    description: "Copy your current recommendations. Our AI extracts vendors automatically. No manual data entry.",
    step: "Step 1: Paste Your Guidebook"
  },
  {
    icon: Compass,
    title: "Find Hidden Earnings",
    description: "Browse 50+ local Tulum vendors with affiliate programs you didn't know existed. Tours, restaurants, transportation, and more.",
    step: "Step 2: Discover Affiliate Programs"
  },
  {
    icon: DollarSign,
    title: "Automatic Commissions",
    description: "Share one link with guests: stackd.com/your-name. You earn 7-12% on every booking. Guests pay the regular price—no markup.",
    step: "Step 3: Earn on Every Booking"
  },
];

const stats = [
  { value: "$850", label: "Average monthly earnings per host" },
  { value: "23%", label: "Guest conversion rate" },
  { value: "50+", label: "Local vendors in Tulum" },
];

const features = [
  {
    title: "Host-Curated Experiences",
    description: "Your personal recommendations, not algorithmic suggestions",
  },
  {
    title: "Automated Commission Tracking",
    description: "See exactly what you've earned from each vendor, updated in real-time",
  },
  {
    title: "2-Minute Setup",
    description: "Paste your guidebook, we handle the rest. No technical skills required",
  },
];

const faqs = [
  {
    question: "Do my guests pay more?",
    answer: "No. Guests pay the vendor's regular price. Your commission comes from the vendor, not the guest."
  },
  {
    question: "How do I get paid?",
    answer: "Automatic payouts every week via Stripe. No chasing vendors for payment."
  },
  {
    question: "What if I already recommend these places?",
    answer: "Perfect! Now you'll get paid for recommendations you're already making for free."
  },
  {
    question: "Is there a monthly fee?",
    answer: "No. We only make money when you make money (3% of commission)."
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, role } = useAuthContext();
  const isMobile = useIsMobile();
  const forceBrowserView = searchParams.get('view') === 'browser';
  const [email, setEmail] = useState("");

  // Redirect mobile users to app view (unless they explicitly want browser view)
  useEffect(() => {
    if (isMobile && !forceBrowserView) {
      navigate("/appview");
    }
  }, [isMobile, navigate, forceBrowserView]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background image with blur and overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'blur(2px)',
          }}
        />
        <div className="absolute inset-0 bg-background/70 dark:bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

        {/* Theme Toggle - Top Left */}
        <div className="absolute top-6 left-6 z-50">
          <ThemeToggle />
        </div>

        {/* AI Chat & Minimal Dock - Top Right */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <Link
            to="/trip-planner"
            className="p-2.5 rounded-full bg-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            title="AI Trip Planner"
          >
            <Sparkles className="h-5 w-5" />
          </Link>
          <MinimalDock />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="mb-4 animate-fade-in">
              <img src={stackdLogo} alt="stackd logo" className="h-48 w-48 sm:h-56 sm:w-56 lg:h-64 lg:w-64 drop-shadow-2xl mx-auto" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Turn Your Airbnb Recommendations Into Income
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Create affiliate partnerships with local Tulum vendors. Earn 7-12% commission on every booking your guests make.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {/* Primary Button - I'm an Airbnb Host */}
              <Link 
                to="/signup/host"
                className="relative group flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-10 py-5 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>I'm an Airbnb Host</span>
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Button - I'm a Guest */}
              <Link 
                to="/appview"
                className="flex items-center justify-center bg-transparent border-2 border-foreground/20 hover:border-teal-600 rounded-xl px-10 py-5 font-semibold text-lg transition-all duration-300 text-foreground hover:text-teal-600 hover:scale-[1.02] active:scale-[0.98]"
              >
                I'm a Guest
              </Link>
            </div>

            {/* Sign In Link */}
            <p className="text-sm text-muted-foreground pt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Already have an account?{" "}
              <Link to="/signin" className="text-teal-600 hover:text-teal-500 hover:underline font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-background py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start earning from your recommendations in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <Card 
                key={index} 
                className="relative p-8 bg-card border border-border/50 hover:border-teal-600/30 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-8 bg-teal-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                  Step {index + 1}
                </div>
                
                <div className="pt-4">
                  <div className="w-14 h-14 bg-teal-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600/20 transition-colors">
                    <step.icon className="h-7 w-7 text-teal-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
              How Commissions Work
            </h2>
          </div>

          <Card className="p-8 sm:p-12 bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-6">For New Partnerships:</h3>
            
            <div className="space-y-4">
              {[
                "Vendor pays 10% commission total",
                "You keep 7%, we keep 3%",
                "Guest pays the listed price (no markup)",
                "No hidden fees. No monthly costs."
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-background py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-8 text-center bg-card border border-border/50 hover:border-teal-600/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl sm:text-5xl font-black text-teal-600 mb-2">
                  {stat.value}
                </div>
                <p className="text-muted-foreground text-lg">
                  {stat.label}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-muted/30 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
              Why Hosts Love Stackd
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Tulum Section */}
      <section className="relative bg-background py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-600/10 text-teal-600 px-4 py-2 rounded-full mb-6">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Launch Location</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6">
            Starting in Tulum, Mexico
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're launching with Tulum's best local vendors—cenote tours, private chefs, transportation, water sports, and beach clubs. More cities coming soon.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-muted/30 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
              Common Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-lg transition-all"
              >
                <AccordionTrigger className="text-left text-lg font-semibold py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="relative bg-gradient-to-br from-teal-600 to-teal-700 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Ready to Monetize Your Recommendations?
          </h2>
          
          <p className="text-lg text-teal-100 mb-8">
            Join 200+ Tulum hosts on the waitlist
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 px-6 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white"
              />
              <Button 
                className="h-14 px-8 rounded-xl bg-white text-teal-700 hover:bg-teal-50 font-semibold text-lg shadow-lg"
              >
                Join Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-teal-200 mt-6">
            We'll notify you when we launch. No spam, ever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footerdemo />
    </div>
  );
};

export default Home;
