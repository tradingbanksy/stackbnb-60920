import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "@/hooks/use-toast";

// Image imports
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

export const getExperienceImage = (experience: { id: number }) => {
  const imageMap: Record<number, string> = {
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

interface ExperienceCardProps {
  experience: {
    id: number;
    name: string;
    vendor: string;
    rating: number;
    reviewCount: number;
    duration: string;
    price: number;
    categoryIcon?: string;
  };
  showAddButton?: boolean;
}

export const ExperienceCard = ({ experience, showAddButton = false }: ExperienceCardProps) => {
  const { isAuthenticated, role } = useAuthContext();
  const { hasRecommendation, addRecommendation, removeRecommendation } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const vendorId = String(experience.id);
  const isHost = isAuthenticated && role === 'host';
  const isSaved = hasRecommendation(vendorId, 'vendor');
  const shouldShowButton = showAddButton && isHost;

  const handleAddClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (isSaved) {
        await removeRecommendation(vendorId, 'vendor');
        toast({
          title: 'Removed from Vendor List',
          description: `${experience.name} has been removed from your vendors.`,
        });
      } else {
        await addRecommendation({ id: vendorId, type: 'vendor' });
        toast({
          title: 'Added to Vendor List',
          description: `${experience.name} has been added to your vendors.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update your vendor list. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      to={`/experience/${experience.id}`}
      className="block group"
    >
      <div className="space-y-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
          <img
            src={getExperienceImage(experience)}
            alt={experience.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Add Button for Hosts - Top Left (replaces emoji badge) */}
          {shouldShowButton ? (
            <button
              onClick={handleAddClick}
              disabled={isLoading}
              className={`absolute top-2 left-2 z-20 p-2 rounded-full shadow-lg transition-all duration-200 ${
                isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/95 text-foreground hover:bg-primary hover:text-white'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSaved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          ) : (
            /* Category Badge - Only show when not in host mode */
            experience.categoryIcon && (
              <div className="absolute top-2 left-2 z-20">
                <Badge variant="secondary" className="bg-white/95 text-foreground backdrop-blur-sm shadow-md text-xs px-2 py-0.5">
                  <span>{experience.categoryIcon}</span>
                </Badge>
              </div>
            )
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {experience.name}
          </h3>

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
  );
};

export default ExperienceCard;
