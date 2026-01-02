import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, ArrowLeft, Store, Share2, Copy, Check, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { experiences } from "@/data/mockData";
import heroImage from "@/assets/hero-beach.jpg";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSignup } from "@/contexts/SignupContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import HostBottomNav from "@/components/HostBottomNav";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaWhatsapp } from "react-icons/fa";

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
  const navigate = useNavigate();
  const { recommendations, isLoading, profile } = useProfile();
  const { hostSignupData } = useSignup();
  const { user } = useAuthContext();
  const [copied, setCopied] = useState(false);

  // Ensure the public guest guide can display a name (it reads from profiles.full_name)
  useEffect(() => {
    const fullName = `${hostSignupData.firstName} ${hostSignupData.lastName}`.trim();
    if (!user || !fullName) return;
    if (profile?.full_name && profile.full_name.trim()) return;

    supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', user.id);
  }, [user, hostSignupData.firstName, hostSignupData.lastName, profile?.full_name]);

  const guideUrl = user ? `${window.location.origin}/guide/${user.id}` : "";
  const shareMessage = `Check out my curated guest guide with local recommendations: ${guideUrl}`;

  const handleCopyLink = async () => {
    if (!guideUrl) return;
    try {
      await navigator.clipboard.writeText(guideUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share this link with your guests" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleShareSMS = () => {
    if (!guideUrl) return;
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!guideUrl) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  // Get vendor IDs from recommendations
  const savedVendorIds = useMemo(() => {
    return recommendations
      .filter(r => r.type === 'vendor')
      .map(r => r.id);
  }, [recommendations]);

  // Filter experiences by saved vendor IDs (using experience id as the vendor identifier)
  const savedExperiences = useMemo(() => {
    return experiences.filter(exp => 
      savedVendorIds.includes(String(exp.id))
    );
  }, [savedVendorIds]);

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
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link 
              to="/explore?mode=host"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:scale-105 transition-all text-sm"
            >
              Explore Vendors
            </Link>
            
            {savedVendorIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-primary text-primary font-medium hover:bg-primary/10 transition-all text-sm gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                    {copied ? (
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareSMS} className="cursor-pointer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share via Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer">
                    <FaWhatsapp className="h-4 w-4 mr-2 text-green-500" />
                    Share via WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
          </Card>
        ) : (
          /* Vendors Grid - Smaller cards like AppView */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-12">
            {savedExperiences.map((experience) => (
              <Link
                key={experience.id}
                to={`/experience/${experience.id}`}
                className="block group"
              >
                <div className="space-y-1.5">
                  {/* Image - Smaller like AppView */}
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
                    <img 
                      src={getExperienceImage(experience.id)}
                      alt={experience.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      <Badge variant="secondary" className="bg-white/95 text-foreground backdrop-blur-sm shadow-md text-xs px-1.5 py-0.5">
                        <span>{experience.categoryIcon}</span>
                      </Badge>
                    </div>

                    {/* Gradient overlay with name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium line-clamp-1">{experience.name}</p>
                    </div>
                  </div>

                  {/* Content - Compact */}
                  <div className="space-y-0.5 px-0.5">
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {experience.vendor}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{experience.rating}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">${experience.price}</span>
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
