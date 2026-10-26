import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResolvedGoogleRating } from "@/lib/googleRating";

interface GoogleRatingProps {
  value: ResolvedGoogleRating | null;
  showCount?: boolean;
  /** Text shown when there is no real rating. Pass null to render nothing. */
  emptyLabel?: string | null;
  className?: string;
  starClassName?: string;
}

/** The one component used to display a Google rating everywhere. */
export function GoogleRating({
  value,
  showCount = true,
  emptyLabel = "No rating yet",
  className,
  starClassName = "h-3.5 w-3.5",
}: GoogleRatingProps) {
  if (!value) {
    return emptyLabel ? (
      <span className={cn("text-muted-foreground", className)}>{emptyLabel}</span>
    ) : null;
  }
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn("fill-yellow-400 text-yellow-400", starClassName)} aria-hidden />
      <span className="font-medium">{value.rating.toFixed(1)}</span>
      {showCount && value.reviewCount ? (
        <span className="text-muted-foreground">({value.reviewCount.toLocaleString()})</span>
      ) : null}
      <span className="sr-only">Google rating</span>
    </span>
  );
}

export default GoogleRating;
