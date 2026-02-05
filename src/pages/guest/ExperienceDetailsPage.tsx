import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock, Users, CheckCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { experiences } from "@/data/mockData";
 import ImageCarousel from "@/components/ImageCarousel";
import { GuestGuideButton } from "@/components/GuestGuideButton";
import { VendorListButton } from "@/components/VendorListButton";
import { FaWater, FaBicycle, FaSwimmer, FaCamera, FaSpa, FaWineGlass, FaMotorcycle, FaShip, FaTree, FaHorse, FaMask, FaMountain, FaParachuteBox, FaPray, FaFish, FaUtensils, FaCloudSun, FaGlassCheers } from 'react-icons/fa';

// Base images
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

// Variant images
import kayaking2Img from "@/assets/experiences/kayaking-2.jpg";
import kayaking3Img from "@/assets/experiences/kayaking-3.jpg";
import snorkeling2Img from "@/assets/experiences/snorkeling-2.jpg";
import snorkeling3Img from "@/assets/experiences/snorkeling-3.jpg";
import scuba2Img from "@/assets/experiences/scuba-2.jpg";
import scuba3Img from "@/assets/experiences/scuba-3.jpg";
import hiking2Img from "@/assets/experiences/hiking-2.jpg";
import hiking3Img from "@/assets/experiences/hiking-3.jpg";
import balloon2Img from "@/assets/experiences/balloon-2.jpg";
import balloon3Img from "@/assets/experiences/balloon-3.jpg";
import parasailing2Img from "@/assets/experiences/parasailing-2.jpg";
import parasailing3Img from "@/assets/experiences/parasailing-3.jpg";

// Experience configuration with unique images, titles, and icons
const experienceConfig: Record<number, { images: string[]; titles: string[]; icons: React.ReactNode[] }> = {
  1: { // Kayak Tour
    images: [kayakingImg, kayaking2Img, kayaking3Img],
    titles: ["Sunset Paddle", "Bay Exploration", "Aerial View"],
    icons: [<FaWater size={20} className="text-white" />, <FaWater size={20} className="text-white" />, <FaWater size={20} className="text-white" />]
  },
  2: { // Bike Rental
    images: [bikesImg, bikesImg, bikesImg],
    titles: ["Beach Cruisers", "Coastal Path", "Scenic Route"],
    icons: [<FaBicycle size={20} className="text-white" />, <FaBicycle size={20} className="text-white" />, <FaBicycle size={20} className="text-white" />]
  },
  3: { // Snorkeling
    images: [snorkelingImg, snorkeling2Img, snorkeling3Img],
    titles: ["Crystal Waters", "Coral Reef", "Snorkel Gear"],
    icons: [<FaSwimmer size={20} className="text-white" />, <FaSwimmer size={20} className="text-white" />, <FaSwimmer size={20} className="text-white" />]
  },
  4: { // Photography
    images: [photographyImg, photographyImg, photographyImg],
    titles: ["Golden Hour", "Beach Portrait", "Scenic Shot"],
    icons: [<FaCamera size={20} className="text-white" />, <FaCamera size={20} className="text-white" />, <FaCamera size={20} className="text-white" />]
  },
  5: { // Spa
    images: [spaImg, yogaImg, spaImg],
    titles: ["Massage Suite", "Relaxation", "Treatment Room"],
    icons: [<FaSpa size={20} className="text-white" />, <FaSpa size={20} className="text-white" />, <FaSpa size={20} className="text-white" />]
  },
  6: { // Food & Wine Tour
    images: [diningImg, wineImg, cookingImg],
    titles: ["Gourmet Dish", "Wine Tasting", "Local Cuisine"],
    icons: [<FaUtensils size={20} className="text-white" />, <FaWineGlass size={20} className="text-white" />, <FaUtensils size={20} className="text-white" />]
  },
  7: { // ATV Adventure
    images: [atvImg, atvImg, atvImg],
    titles: ["Jungle Trail", "Off-Road Action", "Muddy Fun"],
    icons: [<FaMotorcycle size={20} className="text-white" />, <FaMotorcycle size={20} className="text-white" />, <FaMotorcycle size={20} className="text-white" />]
  },
  8: { // Boat Rental
    images: [boatImg, fishingImg, boatImg],
    titles: ["Private Charter", "Ocean Cruise", "Island Hop"],
    icons: [<FaShip size={20} className="text-white" />, <FaShip size={20} className="text-white" />, <FaShip size={20} className="text-white" />]
  },
  9: { // Zipline
    images: [ziplineImg, ziplineImg, ziplineImg],
    titles: ["Canopy Flight", "Forest View", "Adventure"],
    icons: [<FaTree size={20} className="text-white" />, <FaTree size={20} className="text-white" />, <FaTree size={20} className="text-white" />]
  },
  10: { // Horseback
    images: [horsebackImg, horsebackImg, horsebackImg],
    titles: ["Beach Ride", "Sunset Trail", "Gentle Horse"],
    icons: [<FaHorse size={20} className="text-white" />, <FaHorse size={20} className="text-white" />, <FaHorse size={20} className="text-white" />]
  },
  11: { // Scuba
    images: [scubaImg, scuba2Img, scuba3Img],
    titles: ["Deep Dive", "Shipwreck", "Dive Gear"],
    icons: [<FaMask size={20} className="text-white" />, <FaMask size={20} className="text-white" />, <FaMask size={20} className="text-white" />]
  },
  12: { // Hiking
    images: [hikingImg, hiking2Img, hiking3Img],
    titles: ["Summit Trail", "Group Hike", "Peak View"],
    icons: [<FaMountain size={20} className="text-white" />, <FaMountain size={20} className="text-white" />, <FaMountain size={20} className="text-white" />]
  },
  13: { // Parasailing
    images: [parasailingImg, parasailing2Img, parasailing3Img],
    titles: ["High Flying", "Ocean View", "Tropical Coast"],
    icons: [<FaParachuteBox size={20} className="text-white" />, <FaParachuteBox size={20} className="text-white" />, <FaParachuteBox size={20} className="text-white" />]
  },
  14: { // Yoga
    images: [yogaImg, spaImg, yogaImg],
    titles: ["Beach Yoga", "Meditation", "Sunset Flow"],
    icons: [<FaPray size={20} className="text-white" />, <FaPray size={20} className="text-white" />, <FaPray size={20} className="text-white" />]
  },
  15: { // Fishing
    images: [fishingImg, boatImg, fishingImg],
    titles: ["Big Catch", "Charter Boat", "Deep Sea"],
    icons: [<FaFish size={20} className="text-white" />, <FaFish size={20} className="text-white" />, <FaFish size={20} className="text-white" />]
  },
  16: { // Cooking Class
    images: [cookingImg, diningImg, cookingImg],
    titles: ["Chef Demo", "Plated Dish", "Kitchen Action"],
    icons: [<FaUtensils size={20} className="text-white" />, <FaUtensils size={20} className="text-white" />, <FaUtensils size={20} className="text-white" />]
  },
  17: { // Hot Air Balloon
    images: [balloonImg, balloon2Img, balloon3Img],
    titles: ["Sunrise Flight", "Valley View", "Basket View"],
    icons: [<FaCloudSun size={20} className="text-white" />, <FaCloudSun size={20} className="text-white" />, <FaCloudSun size={20} className="text-white" />]
  },
  18: { // Wine Tasting
    images: [wineImg, diningImg, wineImg],
    titles: ["Vineyard Toast", "Food Pairing", "Cellar Tour"],
    icons: [<FaGlassCheers size={20} className="text-white" />, <FaGlassCheers size={20} className="text-white" />, <FaGlassCheers size={20} className="text-white" />]
  },
};

const getExperienceConfig = (experienceId: number) => {
  return experienceConfig[experienceId] || {
    images: [kayakingImg, kayaking2Img, kayaking3Img],
    titles: ["Adventure View", "Action Shot", "Scenic Beauty"],
    icons: [<FaWater size={20} className="text-white" />, <FaWater size={20} className="text-white" />, <FaWater size={20} className="text-white" />]
  };
};

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const experience = experiences.find(exp => exp.id === Number(id));

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/appview');
    }
  };
  
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
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold">Experience</span>
          </div>
        </header>

        {/* Interactive Photo Selector */}
        <div className="mb-4">
           {(() => {
             const config = getExperienceConfig(experience.id);
             return (
               <ImageCarousel 
                 images={config.images}
                 titles={config.titles}
                 icons={config.icons}
                 alt={experience.name}
               />
             );
           })()}
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


          {/* Host Vendor List Button */}
          <VendorListButton
            vendorId={String(experience.vendorId)}
            vendorName={experience.vendor}
          />
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
