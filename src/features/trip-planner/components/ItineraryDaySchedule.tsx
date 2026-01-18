import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Utensils,
  Bus,
  Sparkles,
  Coffee,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ItineraryDay, ItineraryItem, ItineraryItemCategory } from "../types";

const categoryIcons: Record<ItineraryItemCategory, typeof Utensils> = {
  food: Utensils,
  activity: Sparkles,
  transport: Bus,
  free: Coffee,
};

const categoryColors: Record<ItineraryItemCategory, string> = {
  food: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  activity: "text-primary bg-primary/10 border-primary/20",
  transport: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  free: "text-muted-foreground bg-muted border-border",
};

const categoryLabels: Record<ItineraryItemCategory, string> = {
  food: "Food & Dining",
  activity: "Activity",
  transport: "Transportation",
  free: "Free Time",
};

interface ScheduleItemProps {
  item: ItineraryItem;
  index: number;
  isLast: boolean;
}

function ScheduleItem({ item, index, isLast }: ScheduleItemProps) {
  const Icon = categoryIcons[item.category];
  const colorClass = categoryColors[item.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="relative"
    >
      <div className="flex gap-4">
        {/* Timeline */}
        <div className="flex flex-col items-center">
          {/* Time badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{item.time}</span>
          </div>
          
          {/* Icon */}
          <div
            className={`mt-3 w-10 h-10 rounded-full flex items-center justify-center border ${colorClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Connector line */}
          {!isLast && (
            <div className="w-px flex-1 min-h-[24px] bg-border mt-3" />
          )}
        </div>

        {/* Content Card */}
        <Card className="flex-1 p-4 mb-4 border-border/60 hover:border-border transition-colors">
          {/* Category label */}
          <span className={`inline-flex items-center gap-1 text-xs font-medium mb-2 ${categoryColors[item.category].split(' ')[0]}`}>
            {categoryLabels[item.category]}
          </span>
          
          {/* Title */}
          <h4 className="font-semibold text-foreground leading-tight">
            {item.title}
          </h4>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {item.description}
          </p>

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}

          {/* Booking Link */}
          {item.bookingLink && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 text-xs"
              onClick={() => window.open(item.bookingLink, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Book Now
            </Button>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

interface ItineraryDayScheduleProps {
  day: ItineraryDay;
}

export function ItineraryDaySchedule({ day }: ItineraryDayScheduleProps) {
  const formattedDate = (() => {
    try {
      return format(parseISO(day.date), "EEEE, MMMM d");
    } catch {
      return day.date;
    }
  })();

  // Empty state
  if (!day.items || day.items.length === 0) {
    return (
      <div className="space-y-4">
        {/* Day header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{day.title}</h3>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>

        {/* Empty state card */}
        <Card className="p-8 text-center border-dashed border-2 bg-muted/30">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Coffee className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-1">Free Day</h4>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            No activities planned. Enjoy exploring on your own or relax!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">{day.title}</h3>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>

      {/* Items count */}
      <p className="text-xs text-muted-foreground">
        {day.items.length} {day.items.length === 1 ? "activity" : "activities"} planned
      </p>

      {/* Timeline */}
      <div className="pt-2">
        {day.items.map((item, index) => (
          <ScheduleItem
            key={`${item.time}-${item.title}-${index}`}
            item={item}
            index={index}
            isLast={index === day.items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
