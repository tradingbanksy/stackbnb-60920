import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Utensils,
  Bus,
  Sparkles,
  Coffee,
  RefreshCw,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PageTransition } from "@/components/PageTransition";
import { useItineraryContext } from "../context/ItineraryContext";
import type { ItineraryDay, ItineraryItem, ItineraryItemCategory } from "../types";

const categoryIcons: Record<ItineraryItemCategory, typeof Utensils> = {
  food: Utensils,
  activity: Sparkles,
  transport: Bus,
  free: Coffee,
};

const categoryColors: Record<ItineraryItemCategory, string> = {
  food: "text-orange-500 bg-orange-500/10",
  activity: "text-primary bg-primary/10",
  transport: "text-blue-500 bg-blue-500/10",
  free: "text-muted-foreground bg-muted",
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = differenceInDays(end, start) + 1;
  
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")} • ${days} days`;
}

interface DaySelectorProps {
  days: ItineraryDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function DaySelector({ days, selectedIndex, onSelect }: DaySelectorProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 p-1">
        {days.map((day, index) => {
          const date = parseISO(day.date);
          const isSelected = index === selectedIndex;
          
          return (
            <button
              key={day.date}
              onClick={() => onSelect(index)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-xl transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="text-xs font-medium uppercase">
                {format(date, "EEE")}
              </span>
              <span className="text-lg font-bold">{format(date, "d")}</span>
              <span className="text-[10px] opacity-80">{format(date, "MMM")}</span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

interface ScheduleItemProps {
  item: ItineraryItem;
  index: number;
}

function ScheduleItem({ item, index }: ScheduleItemProps) {
  const Icon = categoryIcons[item.category];
  const colorClass = categoryColors[item.category];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 border-border/50">
        <div className="flex gap-3">
          {/* Time */}
          <div className="flex-shrink-0 w-14 text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{item.time}</span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="w-px flex-1 bg-border mt-2" />
          </div>
          
          {/* Content */}
          <div className="flex-1 pb-4">
            <h4 className="font-semibold text-foreground">{item.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            
            {item.location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
            )}
            
            {item.bookingLink && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto mt-2 text-primary"
                onClick={() => window.open(item.bookingLink, "_blank")}
              >
                Book now →
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface DayScheduleProps {
  day: ItineraryDay;
}

function DaySchedule({ day }: DayScheduleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-foreground">{day.title}</h3>
        <span className="text-sm text-muted-foreground">
          {format(parseISO(day.date), "EEEE, MMM d")}
        </span>
      </div>
      
      {day.items.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <Coffee className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Free day - no activities planned</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {day.items.map((item, index) => (
            <ScheduleItem key={`${item.time}-${item.title}`} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ItineraryPage() {
  const navigate = useNavigate();
  const { itinerary, clearItinerary } = useItineraryContext();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const selectedDay = useMemo(() => {
    if (!itinerary || !itinerary.days.length) return null;
    return itinerary.days[selectedDayIndex] || itinerary.days[0];
  }, [itinerary, selectedDayIndex]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/trip-planner");
    }
  };

  const handleEdit = () => {
    // Navigate back to trip planner to edit
    navigate("/trip-planner");
  };

  const handleRegenerate = () => {
    // Clear and go back to trip planner
    clearItinerary();
    navigate("/trip-planner");
  };

  const handleConfirm = () => {
    // Navigate to the saved itinerary page
    navigate("/itinerary");
  };

  // Empty state if no itinerary
  if (!itinerary) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No itinerary yet</h2>
          <p className="text-muted-foreground text-center mb-6">
            Chat with the Trip Planner to create your personalized itinerary.
          </p>
          <Button onClick={() => navigate("/trip-planner")}>
            <Sparkles className="h-4 w-4 mr-2" />
            Start Planning
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                {itinerary.destination}
              </h1>
              <p className="text-xs text-muted-foreground">
                {formatDateRange(itinerary.startDate, itinerary.endDate)}
              </p>
            </div>
          </div>
          
          {/* Day Selector */}
          <div className="px-4 pb-3">
            <DaySelector
              days={itinerary.days}
              selectedIndex={selectedDayIndex}
              onSelect={setSelectedDayIndex}
            />
          </div>
        </header>

        {/* Day Schedule */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div
                key={selectedDay.date}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DaySchedule day={selectedDay} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sticky Footer Actions */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 safe-area-bottom">
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRegenerate}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleConfirm}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
