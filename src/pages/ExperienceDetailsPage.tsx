import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock, Users, CheckCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { experiences } from "@/data/mockData";
import InteractiveSelector from "@/components/ui/interactive-selector";
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

const getExperienceImages = (experienceId: number): string[] => {
  // Each experience shows only contextually relevant images
  const imageMap: Record<number, string[]> = {
    1: [kayakingImg, kayakingImg, boatImg],           // Kayak Tour - water activities
    2: [bikesImg, bikesImg, bikesImg],                // Bike Rental - cycling only
    3: [snorkelingImg, snorkelingImg, scubaImg],      // Snorkeling - underwater
    4: [photographyImg, photographyImg, photographyImg], // Photography
    5: [spaImg, spaImg, yogaImg],                     // Spa - wellness
    6: [diningImg, wineImg, cookingImg],              // Food & Wine Tour - food related
    7: [atvImg, atvImg, atvImg],                      // ATV Adventure
    8: [boatImg, boatImg, fishingImg],                // Boat Rental - water
    9: [ziplineImg, ziplineImg, ziplineImg],          // Zipline - canopy
    10: [horsebackImg, horsebackImg, horsebackImg],   // Horseback Riding
    11: [scubaImg, scubaImg, snorkelingImg],          // Scuba Diving - underwater
    12: [hikingImg, hikingImg, hikingImg],            // Hiking Expedition
    13: [parasailingImg, parasailingImg, parasailingImg], // Parasailing
    14: [yogaImg, yogaImg, spaImg],                   // Yoga - wellness
    15: [fishingImg, fishingImg, boatImg],            // Fishing Charter - water/fishing
    16: [cookingImg, cookingImg, diningImg],          // Cooking Class - food
    17: [balloonImg, balloonImg, balloonImg],         // Hot Air Balloon
    18: [wineImg, wineImg, diningImg],                // Wine Tasting - beverage/food
  };
  return imageMap[experienceId] || [kayakingImg, kayakingImg, kayakingImg];
};

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const experience = experiences.find(exp => exp.id === Number(id));
  
  if (!experience) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Experience not found</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Back to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold">Experience</span>
          </div>
        </header>

        {/* Interactive Photo Selector */}
        <div className="mb-4">
          <InteractiveSelector 
            photos={getExperienceImages(experience.id)} 
            titles={["Adventure View", "Action Shot", "Scenic Beauty"]}
          />
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Experience Header */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{experience.categoryIcon}</span>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-bold leading-tight">{experience.name}</h1>
                <p className="text-muted-foreground">{experience.vendor}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{experience.rating}</span>
                <span className="text-muted-foreground">({experience.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">{experience.duration}</p>
              </div>
              <div className="space-y-1">
                <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">Max {experience.maxGuests}</p>
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                  ${experience.price}
                </Badge>
                <p className="text-xs text-muted-foreground">per person</p>
              </div>
            </div>
          </Card>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">About This Experience</h2>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {experience.description}
              </p>
            </Card>
          </div>

          {/* What's Included */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">What's Included</h2>
            <Card className="p-4">
              <ul className="space-y-2">
                {experience.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg">
          <div className="max-w-[375px] mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-2xl font-bold">${experience.price}</p>
            </div>
            <Button 
              variant="gradient" 
              size="lg"
              className="flex-1"
              onClick={() => navigate(`/booking/${experience.id}`)}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;
