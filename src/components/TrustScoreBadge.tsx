import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustScoreBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const getTier = (score: number) => {
  if (score >= 61) return { label: "Highly Trusted", color: "text-green-500", bg: "bg-green-500/10", ring: "ring-green-500/20", icon: ShieldCheck };
  if (score >= 30) return { label: "Trusted", color: "text-blue-500", bg: "bg-blue-500/10", ring: "ring-blue-500/20", icon: Shield };
  return { label: "Getting Started", color: "text-amber-500", bg: "bg-amber-500/10", ring: "ring-amber-500/20", icon: ShieldAlert };
};

export function TrustScoreBadge({ score, className, showLabel = true, size = "md" }: TrustScoreBadgeProps) {
  const tier = getTier(score);
  const Icon = tier.icon;

  const sizeClasses = {
    sm: { icon: "h-4 w-4", text: "text-xs", score: "text-sm", pad: "px-2 py-1", gap: "gap-1.5" },
    md: { icon: "h-5 w-5", text: "text-sm", score: "text-base", pad: "px-3 py-1.5", gap: "gap-2" },
    lg: { icon: "h-6 w-6", text: "text-base", score: "text-lg", pad: "px-4 py-2", gap: "gap-2.5" },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn("inline-flex items-center rounded-full ring-1", tier.bg, tier.ring, s.pad, s.gap, className)}>
      <Icon className={cn(s.icon, tier.color)} />
      <span className={cn("font-bold", s.score, tier.color)}>{score}</span>
      {showLabel && (
        <span className={cn("font-medium text-muted-foreground", s.text)}>{tier.label}</span>
      )}
    </div>
  );
}
