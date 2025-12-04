import { Link } from "react-router-dom";
import { Star, Heart, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isRestaurantOpen, type Restaurant } from "@/data/mockRestaurants";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { formatDistance } from "@/services/geoapifyService";

interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'horizontal' | 'vertical' | 'grid';
  size?: 'default' | 'small';
}

const RestaurantCard = ({ restaurant, variant = 'horizontal', size = 'default' }: RestaurantCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const isOpen = isRestaurantOpen(restaurant);
  const isSmall = size === 'small';

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("restaurantFavorites") || "[]");
    setIsFavorite(favorites.includes(restaurant.id));
  }, [restaurant.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem("restaurantFavorites") || "[]");
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((fav: string) => fav !== restaurant.id);
      toast({ title: "Removed from favorites", duration: 2000 });
    } else {
      newFavorites = [...favorites, restaurant.id];
      // Always cache the restaurant data so it can be retrieved in wishlists
      localStorage.setItem(`restaurant_${restaurant.id}`, JSON.stringify(restaurant));
      toast({ title: "Added to favorites", duration: 2000 });
    }
    localStorage.setItem("restaurantFavorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  // Cache API restaurant data before navigating
  const handleClick = (e: React.MouseEvent) => {
    if (restaurant.isFromApi) {
      localStorage.setItem(`restaurant_${restaurant.id}`, JSON.stringify(restaurant));
    }
  };

  if (variant === 'vertical') {
    return (
      <Link
        to={`/restaurant/${restaurant.id}`}
        className="block group"
        onClick={handleClick}
      >
        <div className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <img
              src={restaurant.photos[0]}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              style={{ 
                imageRendering: 'crisp-edges',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            />
            <button
              onClick={toggleFavorite}
              className="absolute top-1.5 right-1.5 p-1 rounded-full hover:scale-110 active:scale-95 transition-transform"
            >
              <Heart
                className={`h-4 w-4 drop-shadow-md ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "fill-black/50 text-white stroke-white stroke-2"
                }`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-1">{restaurant.name}</h3>
              {Object.keys(restaurant.hours || {}).length > 0 && (
                <Badge 
                  variant={isOpen ? "default" : "secondary"} 
                  className="text-[10px] shrink-0 px-1.5 py-0"
                >
                  {isOpen ? "Open" : "Closed"}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {restaurant.cuisine}
              {restaurant.priceRange && ` • ${restaurant.priceRange}`}
            </p>
            
            {restaurant.rating !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                {restaurant.reviewCount !== undefined && (
                  <span className="text-muted-foreground">({restaurant.reviewCount})</span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{restaurant.neighborhood || restaurant.city}</span>
              {restaurant.distance && (
                <>
                  <span>•</span>
                  <Navigation className="h-3 w-3" />
                  <span>{formatDistance(restaurant.distance)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Card for horizontal scroll or grid
  const cardWidth = variant === 'grid' ? 'w-full' : 'flex-shrink-0 w-[200px]';
  
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className={`${cardWidth} group`}
      onClick={handleClick}
    >
      <div className={isSmall ? "space-y-1" : "space-y-2"}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <img
            src={restaurant.photos[0]}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            style={{ 
              imageRendering: 'crisp-edges',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
          
          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className={`absolute top-1 right-1 z-10 ${isSmall ? 'p-0.5' : 'p-1.5'} rounded-full hover:scale-110 active:scale-95 transition-transform`}
          >
            <Heart
              className={`${isSmall ? 'h-3.5 w-3.5' : 'h-5 w-5'} drop-shadow-md ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "fill-black/50 text-white stroke-white stroke-2"
              }`}
            />
          </button>

          {/* Open/Closed badge - only show if we have hours data and not small */}
          {!isSmall && Object.keys(restaurant.hours || {}).length > 0 && (
            <Badge 
              className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 ${
                isOpen 
                  ? 'bg-green-500/90 text-white border-0' 
                  : 'bg-black/70 text-white border-0'
              }`}
            >
              {isOpen ? "Open Now" : "Closed"}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-0.5">
          <h3 className={`font-semibold leading-tight line-clamp-1 ${isSmall ? 'text-xs' : 'text-sm'}`}>
            {restaurant.name}
          </h3>
          {!isSmall && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {restaurant.cuisine} • {restaurant.neighborhood || restaurant.city}
            </p>
          )}
          <div className={`flex items-center ${isSmall ? 'gap-0.5' : 'justify-between pt-0.5'}`}>
            <div className="flex items-center gap-0.5">
              {restaurant.rating !== undefined ? (
                <>
                  <Star className={`${isSmall ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} fill-yellow-400 text-yellow-400`} />
                  <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} font-medium`}>{restaurant.rating.toFixed(1)}</span>
                </>
              ) : (
                <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>No ratings</span>
              )}
            </div>
            {!isSmall && (
              <div className="flex items-center gap-1">
                {restaurant.distance && (
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Navigation className="h-3 w-3" />
                    {formatDistance(restaurant.distance)}
                  </span>
                )}
                {restaurant.priceRange && (
                  <span className="text-xs font-medium">{restaurant.priceRange}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
