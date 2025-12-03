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
  const imageMap: Record<number, string[]> = {
    1: [kayakingImg, boatImg, snorkelingImg],
    2: [bikesImg, hikingImg, photographyImg],
    3: [snorkelingImg, kayakingImg, scubaImg],
    4: [photographyImg, yogaImg, spaImg],
    5: [spaImg, yogaImg, diningImg],
    6: [diningImg, wineImg, cookingImg],
    7: [atvImg, ziplineImg, hikingImg],
    8: [boatImg, kayakingImg, fishingImg],
    9: [ziplineImg, atvImg, hikingImg],
    10: [horsebackImg, hikingImg, photographyImg],
    11: [scubaImg, snorkelingImg, kayakingImg],
    12: [hikingImg, photographyImg, yogaImg],
    13: [parasailingImg, boatImg, kayakingImg],
    14: [yogaImg, spaImg, hikingImg],
    15: [fishingImg, boatImg, kayakingImg],
    16: [cookingImg, diningImg, wineImg],
    17: [balloonImg, photographyImg, hikingImg],
    18: [wineImg, diningImg, cookingImg],
  };
  return imageMap[experienceId] || [kayakingImg, boatImg, snorkelingImg];
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
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-4 border-b">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

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
