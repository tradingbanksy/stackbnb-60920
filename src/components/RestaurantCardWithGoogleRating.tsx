import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { BlurImage } from "@/components/BlurImage";
import { supabase } from "@/integrations/supabase/client";
import type { Restaurant } from "@/data/mockRestaurants";

interface GoogleReviewsData {
  rating?: number;
  totalReviews?: number;
  photos?: string[];
}

interface CachedGoogleData extends GoogleReviewsData {
  timestamp: number;
}

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const getCacheKey = (restaurantId: string) => `google_reviews_${restaurantId}`;

const getCachedData = (restaurantId: string): GoogleReviewsData | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(restaurantId));
    if (!cached) return null;
    
    const parsed: CachedGoogleData = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(getCacheKey(restaurantId));
      return null;
    }
    
    return { rating: parsed.rating, totalReviews: parsed.totalReviews, photos: parsed.photos };
  } catch {
    return null;
  }
};

const setCachedData = (restaurantId: string, data: GoogleReviewsData) => {
  try {
    const cacheData: CachedGoogleData = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(restaurantId), JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching Google data:', error);
  }
};

interface RestaurantCardWithGoogleRatingProps {
  restaurant: Restaurant;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  showFavoriteButton?: boolean;
}

export const RestaurantCardWithGoogleRating = ({
  restaurant,
  index,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false,
}: RestaurantCardWithGoogleRatingProps) => {
  const [googleData, setGoogleData] = useState<GoogleReviewsData | null>(() => 
    getCachedData(restaurant.id)
  );

  useEffect(() => {
    // If we have cached data, don't fetch
    if (googleData) return;

    const fetchGoogleRating = async () => {
      try {
        const searchQuery = `${restaurant.name} restaurant ${restaurant.address} ${restaurant.city}`;
        const { data, error } = await supabase.functions.invoke('google-reviews', {
          body: { 
            searchQuery,
            lat: restaurant.coordinates?.lat,
            lng: restaurant.coordinates?.lng
          }
        });

        if (!error && data?.rating) {
          const reviewData: GoogleReviewsData = {
            rating: data.rating,
            totalReviews: data.totalReviews,
            photos: data.photos
          };
          setGoogleData(reviewData);
          setCachedData(restaurant.id, reviewData);
        }
      } catch (error) {
        console.error('Error fetching Google rating:', error);
      }
    };

    fetchGoogleRating();
  }, [restaurant, googleData]);

  const displayRating = googleData?.rating ?? restaurant.rating;
  const displayPhoto = googleData?.photos?.[0] ?? restaurant.photos[0];

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="flex-shrink-0 w-36 animate-fade-in group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-square rounded-xl overflow-hidden relative transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]">
        <BlurImage
          src={displayPhoto}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {showFavoriteButton && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(restaurant.id);
            }}
            className="absolute top-2 right-2 z-10"
          >
            <Heart
              className={`h-5 w-5 drop-shadow-md ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "fill-black/40 text-white"
              }`}
            />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium line-clamp-1">{restaurant.name}</p>
          <div className="flex items-center gap-1 text-white/80 text-[10px]">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span>{displayRating?.toFixed(1) ?? 'N/A'}</span>
            <span>•</span>
            <span>{restaurant.priceRange}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCardWithGoogleRating;
