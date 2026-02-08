import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GoogleReview {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

interface GoogleReviewsData {
  reviews: GoogleReview[];
  rating: number;
  totalReviews: number;
  googleMapsUrl: string;
}

interface GoogleReviewsPreviewProps {
  googlePlaceId: string;
  className?: string;
}

export function GoogleReviewsPreview({ googlePlaceId, className }: GoogleReviewsPreviewProps) {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!googlePlaceId) {
      setIsLoading(false);
      return;
    }
    fetchReviews();
  }, [googlePlaceId]);

  const fetchReviews = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke("google-reviews", {
        body: { placeId: googlePlaceId },
      });

      if (error) {
        console.error("Error fetching Google reviews:", error);
        return;
      }

      if (result?.reviews && result.reviews.length > 0) {
        setData(result as GoogleReviewsData);
      }
    } catch (err) {
      console.error("Error fetching Google reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3 w-3",
            star <= rating
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-3 overflow-hidden">
          <Skeleton className="h-[160px] w-[260px] rounded-xl flex-shrink-0" />
          <Skeleton className="h-[160px] w-[260px] rounded-xl flex-shrink-0" />
        </div>
      </div>
    );
  }

  if (!data || data.reviews.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with aggregate rating */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-foreground text-foreground" />
          <span className="text-[22px] font-semibold">{data.rating?.toFixed(1)}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-[15px] text-muted-foreground">
            {data.totalReviews} Google {data.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Horizontal scrollable review cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
        {data.reviews.slice(0, 5).map((review, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[260px] snap-start rounded-xl border border-border p-4 space-y-3"
          >
            {/* Stars */}
            {renderStars(review.rating)}

            {/* Comment */}
            {review.text && (
              <p className="text-[14px] leading-relaxed text-foreground line-clamp-4">
                {review.text}
              </p>
            )}

            {/* Reviewer */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {review.profile_photo_url ? (
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {getInitials(review.author_name)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-[13px]">{review.author_name}</p>
                <p className="text-xs text-muted-foreground">
                  {review.relative_time_description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all on Google link */}
      {data.googleMapsUrl && (
        <a
          href={data.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-semibold underline underline-offset-4 hover:text-foreground/80 transition-colors inline-block"
        >
          View all on Google
        </a>
      )}
    </div>
  );
}
