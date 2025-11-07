import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import VendorBottomNav from "@/components/VendorBottomNav";

const ratingsData = [
  { 
    id: 1, 
    service: "Sunset Yoga Session", 
    host: "Beachside Villa Resort", 
    rating: 5, 
    review: "Exceptional service! The guests were thrilled with the yoga experience. Will definitely book again.",
    hostName: "Jennifer W.",
    date: "Dec 15, 2024"
  },
  { 
    id: 2, 
    service: "Beach Volleyball Tournament", 
    host: "Coastal Paradise Hotel", 
    rating: 4.8, 
    review: "Professional and well-organized. Guests had an amazing time. Highly recommended!",
    hostName: "Robert K.",
    date: "Dec 14, 2024"
  },
  { 
    id: 3, 
    service: "Surfing Lessons", 
    host: "Ocean View Resort", 
    rating: 5, 
    review: "Outstanding instructors and equipment. Our guests can't stop talking about it!",
    hostName: "Maria S.",
    date: "Dec 13, 2024"
  },
  { 
    id: 4, 
    service: "Poolside BBQ Experience", 
    host: "Sunset Bay Hotel", 
    rating: 4.9, 
    review: "Food was incredible and the service impeccable. Guests loved every moment.",
    hostName: "Thomas R.",
    date: "Dec 12, 2024"
  },
  { 
    id: 5, 
    service: "Private Chef Dinner", 
    host: "Luxury Beach Resort", 
    rating: 5, 
    review: "The chef created an unforgettable experience. Guests were blown away!",
    hostName: "Amanda L.",
    date: "Dec 11, 2024"
  },
  { 
    id: 6, 
    service: "Sunset Cruise", 
    host: "Marina Bay Resort", 
    rating: 4.7, 
    review: "Beautiful cruise with professional crew. Minor timing issue but overall excellent.",
    hostName: "David M.",
    date: "Dec 10, 2024"
  },
];

const VendorRatings = () => {
  const avgRating = (ratingsData.reduce((sum, item) => sum + item.rating, 0) / ratingsData.length).toFixed(1);
  const fiveStarCount = ratingsData.filter(r => r.rating === 5).length;
  const fiveStarPercentage = Math.round((fiveStarCount / ratingsData.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        <Link 
          to="/vendor/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Service Ratings</h1>
          <p className="text-sm text-muted-foreground">What hosts are saying</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 col-span-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold">{avgRating}</p>
                <p className="text-sm text-muted-foreground">/ 5.0</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fiveStarPercentage}%</p>
                <p className="text-[10px] text-muted-foreground leading-tight">5-star</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingsData.filter(r => Math.floor(r.rating) === stars).length;
              const percentage = (count / ratingsData.length) * 100;
              
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs w-12">{stars} {stars === 1 ? 'star' : 'stars'}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reviews List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Reviews
          </h2>
          
          <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto">
            {ratingsData.map((item) => (
              <Card
                key={item.id}
                className="p-4 hover:shadow-lg transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight">{item.service}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.host}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-sm">{item.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/80 italic">"{item.review}"</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span className="font-medium">{item.hostName}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <VendorBottomNav />
    </div>
  );
};

export default VendorRatings;
