import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink,
  Navigation,
  Heart,
  Share2,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { mockRestaurants, isRestaurantOpen, type Restaurant } from "@/data/mockRestaurants";
import { formatDistance } from "@/services/geoapifyService";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReservationWebview, setShowReservationWebview] = useState(false);

  useEffect(() => {
    // First try to find in mock data
    let found = mockRestaurants.find(r => r.id === id);
    
    // If not found in mock data, check localStorage for API-fetched restaurants
    if (!found && id?.startsWith('geo_')) {
      const cachedRestaurant = localStorage.getItem(`restaurant_${id}`);
      if (cachedRestaurant) {
        found = JSON.parse(cachedRestaurant);
      }
    }
    
    setRestaurant(found || null);

    // Check if favorited
    const favorites = JSON.parse(localStorage.getItem("restaurantFavorites") || "[]");
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("restaurantFavorites") || "[]");
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((fav: string) => fav !== id);
      toast({ title: "Removed from favorites", duration: 2000 });
    } else {
      newFavorites = [...favorites, id];
      toast({ title: "Added to favorites", duration: 2000 });
    }
    localStorage.setItem("restaurantFavorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share && restaurant) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `Check out ${restaurant.name} - ${restaurant.cuisine}`,
          url: window.location.href,
        });
      } catch {
        toast({ title: "Link copied to clipboard", duration: 2000 });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard", duration: 2000 });
    }
  };

  const handleGetDirections = () => {
    if (restaurant) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${restaurant.address}, ${restaurant.city}`
      )}`;
      window.open(url, '_blank');
    }
  };

  const handleReservation = () => {
    if (!restaurant) return;

    if (restaurant.reservationUrl && restaurant.reservationPlatform) {
      setShowReservationWebview(true);
    } else {
      // Fallback to phone call
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  const handleCall = () => {
    if (restaurant) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  const getDayName = (index: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[index];
  };

  const getCurrentDayIndex = (): number => new Date().getDay();

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Restaurant not found</p>
      </div>
    );
  }

  const isOpen = isRestaurantOpen(restaurant);

  // Reservation webview modal
  if (showReservationWebview && restaurant.reservationUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="sticky top-0 z-10 bg-card border-b border-border flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setShowReservationWebview(false)}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <span className="text-sm font-medium capitalize">{restaurant.reservationPlatform}</span>
          <Button variant="ghost" size="sm" onClick={() => window.open(restaurant.reservationUrl, '_blank')}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <iframe
          src={restaurant.reservationUrl}
          className="w-full h-[calc(100vh-56px)]"
          title="Reservation"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Photo Gallery - Horizontal scroll like Yelp/Airbnb */}
      <div className="relative">
        {/* Back button - fixed above scroll */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 z-20 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Action buttons - fixed above scroll */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <button
            onClick={handleShare}
            className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-colors"
          >
            <Share2 className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={toggleFavorite}
            className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
          </button>
        </div>

        {/* Scrollable photo strip */}
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {restaurant.photos.map((photo, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 snap-start ${index > 0 ? 'pl-1' : ''}`}
              style={{ width: restaurant.photos.length === 1 ? '100%' : '80%' }}
            >
              <div className="aspect-[4/3] max-h-[220px] overflow-hidden">
                <img
                  src={photo}
                  alt={`${restaurant.name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Photo count indicator */}
        {restaurant.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {restaurant.photos.length} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 max-w-[450px] mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <Badge variant={isOpen ? "default" : "secondary"} className="shrink-0">
              {isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-muted-foreground">({restaurant.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span>{restaurant.cuisine}</span>
            <span className="text-muted-foreground">•</span>
            <span>{restaurant.priceRange}</span>
          </div>
        </div>

        {/* Features */}
        {restaurant.features && restaurant.features.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
            <Separator />
          </>
        )}

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>

        <Separator />

        {/* Location */}
        <div className="space-y-3">
          <h2 className="font-semibold">Location</h2>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p>{restaurant.address}</p>
              <p className="text-muted-foreground text-sm">
                {restaurant.neighborhood || restaurant.city}{restaurant.neighborhood && restaurant.city ? `, ${restaurant.city}` : ''}
              </p>
              {restaurant.distance && (
                <p className="text-sm text-primary flex items-center gap-1 mt-1">
                  <Navigation className="h-4 w-4" />
                  {formatDistance(restaurant.distance)} away
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGetDirections}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </div>

        <Separator />

        {/* Contact */}
        <div className="space-y-3">
          <h2 className="font-semibold">Contact</h2>
          {restaurant.phone && (
            <button 
              onClick={handleCall}
              className="flex items-center gap-3 w-full text-left hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="text-primary">{restaurant.phone}</span>
            </button>
          )}
          {restaurant.website && (
            <a 
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full text-left hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="text-primary truncate">{restaurant.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {!restaurant.phone && !restaurant.website && (
            <p className="text-sm text-muted-foreground">Contact information not available</p>
          )}
        </div>

        <Separator />

        {/* Hours */}
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Hours
          </h2>
          <div className="space-y-2">
            {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day, index) => {
              const hours = restaurant.hours[day];
              const isToday = getCurrentDayIndex() === index;
              return (
                <div 
                  key={day} 
                  className={`flex justify-between text-sm ${isToday ? 'font-medium' : ''}`}
                >
                  <span className={isToday ? 'text-primary' : 'text-muted-foreground'}>
                    {getDayName(index)}
                    {isToday && ' (Today)'}
                  </span>
                  <span>
                    {hours ? `${hours.open} - ${hours.close}` : 'Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
        <div className="max-w-[450px] mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            onClick={handleReservation}
          >
            {restaurant.reservationPlatform ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Reserve Table
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Call to Book
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
