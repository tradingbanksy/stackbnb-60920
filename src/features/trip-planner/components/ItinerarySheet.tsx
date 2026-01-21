import { motion } from "framer-motion";
import { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { X, MapPin, Calendar, ChevronLeft, ChevronRight, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItineraryDaySchedule } from "./ItineraryDaySchedule";
import { ItinerarySkeleton } from "./ItinerarySkeleton";
import { RegenerateDialog, type RegenerateOption } from "./RegenerateDialog";
import { ShareItineraryDialog } from "./ShareItineraryDialog";
import { useItineraryContext, type RegenerateMode } from "../context/ItineraryContext";
import { useTripPlannerChatContext } from "../context/TripPlannerChatContext";
import type { ItineraryDay } from "../types";

// Day selector for navigating between days
function DaySelector({ 
  days, 
  selectedIndex, 
  onSelect 
}: { 
  days: ItineraryDay[]; 
  selectedIndex: number; 
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((day, index) => {
        const isSelected = index === selectedIndex;
        let dayLabel = `Day ${index + 1}`;
        
        try {
          const date = parseISO(day.date);
          dayLabel = format(date, "EEE d");
        } catch {
          // Use default label
        }
        
        return (
          <button
            key={day.date}
            onClick={() => onSelect(index)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${isSelected 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            {dayLabel}
          </button>
        );
      })}
    </div>
  );
}

interface ItinerarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItinerarySheet({ open, onOpenChange }: ItinerarySheetProps) {
  const { messages } = useTripPlannerChatContext();
  const { 
    itinerary, 
    isGenerating,
    isSharing,
    hasUserEdits, 
    isConfirmed,
    shareUrl,
    confirmItinerary,
    unconfirmItinerary,
    generateItineraryFromChat,
    clearItinerary,
    generateShareLink,
    removeItem,
  } = useItineraryContext();
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [skeletonStep, setSkeletonStep] = useState(0);

  // Skeleton animation
  if (isGenerating) {
    const interval = setInterval(() => {
      setSkeletonStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);
    setTimeout(() => clearInterval(interval), 6000);
  }

  const handleRegenerateSelect = (option: RegenerateOption) => {
    if (option === null) {
      // User cancelled
      return;
    }
    generateItineraryFromChat(messages, option === "improve" ? "improve" : "full");
  };

  const handleGenerateShareLink = async () => {
    await generateShareLink();
  };

  const handleConfirmToggle = () => {
    if (isConfirmed) {
      unconfirmItinerary();
    } else {
      confirmItinerary();
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const days = differenceInDays(end, start) + 1;
      return `${format(start, "MMM d")} - ${format(end, "MMM d")} • ${days} days`;
    } catch {
      return "";
    }
  };

  // Loading state
  if (isGenerating) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-3xl p-0 flex flex-col"
        >
          <div className="flex-1 overflow-hidden">
            <ItinerarySkeleton currentStep={skeletonStep} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Empty state
  if (!itinerary || !itinerary.days.length) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-3xl p-0"
        >
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Itinerary Yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Chat with JC about your trip to generate a personalized itinerary.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Back to Chat
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const currentDay = itinerary.days[selectedDayIndex];
  const canGoPrev = selectedDayIndex > 0;
  const canGoNext = selectedDayIndex < itinerary.days.length - 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-3xl p-0 flex flex-col"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <SheetHeader className="px-4 pb-3 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{itinerary.destination}</span>
              </SheetTitle>
              {itinerary.startDate && itinerary.endDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateRange(itinerary.startDate, itinerary.endDate)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Day selector */}
          <div className="mt-3">
            <DaySelector
              days={itinerary.days}
              selectedIndex={selectedDayIndex}
              onSelect={setSelectedDayIndex}
            />
          </div>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-4 py-4">
          <motion.div
            key={selectedDayIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ItineraryDaySchedule
              day={currentDay}
              onRemoveItem={(itemIndex) => removeItem(selectedDayIndex, itemIndex)}
            />
          </motion.div>
        </ScrollArea>

        {/* Day navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDayIndex(prev => prev - 1)}
            disabled={!canGoPrev}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Day {selectedDayIndex + 1} of {itinerary.days.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDayIndex(prev => prev + 1)}
            disabled={!canGoNext}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-4 border-t border-border bg-background">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowRegenerateDialog(true)}
          >
            Regenerate
          </Button>
          {isConfirmed ? (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          ) : (
            <Button
              className="flex-1 gap-2"
              onClick={handleConfirmToggle}
            >
              <Check className="h-4 w-4" />
              Confirm
            </Button>
          )}
        </div>

        {/* Dialogs */}
        <RegenerateDialog
          open={showRegenerateDialog}
          onOpenChange={setShowRegenerateDialog}
          onSelect={handleRegenerateSelect}
          hasUserEdits={hasUserEdits}
        />
        <ShareItineraryDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          isGenerating={isSharing}
          shareUrl={shareUrl}
          onGenerateLink={handleGenerateShareLink}
        />
      </SheetContent>
    </Sheet>
  );
}
