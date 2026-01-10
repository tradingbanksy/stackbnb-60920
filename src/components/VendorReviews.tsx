import { useEffect, useState } from "react";
import { Star, MessageSquare, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

interface VendorReviewsProps {
  vendorProfileId: string;
  className?: string;
}

export function VendorReviews({ vendorProfileId, className }: VendorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    fetchReviews();
  }, [vendorProfileId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq("vendor_profile_id", vendorProfileId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile names separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          profiles: { full_name: profileMap.get(review.user_id) || null }
        }));

        setReviews(reviewsWithProfiles);

        // Calculate average rating
        const total = reviewsWithProfiles.reduce((sum, r) => sum + r.rating, 0);
        setAverageRating(total / reviewsWithProfiles.length);
      } else {
        setReviews([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "G";
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with average rating */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Guest Reviews
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.slice(0, 5).map((review) => (
          <Card key={review.id} className="p-4">
            <div className="space-y-3">
              {/* Reviewer info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {review.profiles?.full_name ? (
                      <span className="text-sm font-medium">
                        {getInitials(review.profiles.full_name)}
                      </span>
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {review.profiles?.full_name || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{review.comment}"
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Show more indicator */}
      {reviews.length > 5 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing 5 of {reviews.length} reviews
        </p>
      )}
    </div>
  );
}
