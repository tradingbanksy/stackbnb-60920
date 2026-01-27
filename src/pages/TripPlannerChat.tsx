import { useState, useEffect, useRef } from "react";
import { PageTransition } from "@/components/PageTransition";
import { 
  TripPlannerChatProvider, 
  useTripPlannerChatContext,
  ItineraryProvider 
} from "@/features/trip-planner/context";
import {
  ChatHeader,
  ChatMessageList,
  ChatInputArea,
  QuickActionsBar,
  ChatSuggestionPills,
  AuthPromptDialog,
  ItinerarySheet,
} from "@/features/trip-planner/components";
import { useItineraryContext } from "@/features/trip-planner/context/ItineraryContext";
import { useAuthContext } from "@/contexts/AuthContext";

const AUTH_PROMPT_STORAGE_KEY = "tripPlannerAuthPromptShown";

function TripPlannerChatContent() {
  const { messages } = useTripPlannerChatContext();
  const { isAuthenticated, isLoading } = useAuthContext();
  const { syncTripFromChat } = useItineraryContext();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showItinerarySheet, setShowItinerarySheet] = useState(false);
  const hasMessages = messages.length > 1;
  const didAutoSyncTripRef = useRef(false);

  // Only sync itinerary dates once we actually detect that dates were discussed/confirmed in chat
  useEffect(() => {
    if (didAutoSyncTripRef.current) return;

    const text = messages.map(m => m.content).join("\n");
    const hasDateRange = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b\s*\d{1,2}\s*[-–]\s*\d{1,2}/i.test(text);
    const hasDuration = /\b\d+\s*(?:days?|nights?)\b/i.test(text);

    if (hasDateRange || hasDuration) {
      syncTripFromChat(messages);
      didAutoSyncTripRef.current = true;
    }
  }, [messages, syncTripFromChat]);

  // Show auth prompt for non-authenticated users on first visit
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const hasSeenPrompt = sessionStorage.getItem(AUTH_PROMPT_STORAGE_KEY);
      if (!hasSeenPrompt) {
        // Small delay to let the page load first
        const timer = setTimeout(() => {
          setShowAuthPrompt(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleAuthPromptSkip = () => {
    sessionStorage.setItem(AUTH_PROMPT_STORAGE_KEY, "true");
  };

  const handleAuthPromptClose = (open: boolean) => {
    setShowAuthPrompt(open);
    if (!open) {
      sessionStorage.setItem(AUTH_PROMPT_STORAGE_KEY, "true");
    }
  };

  const handleOpenItinerary = () => {
    setShowItinerarySheet(true);
  };

  return (
    <div className="relative w-full h-screen bg-background flex flex-col">
      <ChatHeader onOpenItinerary={handleOpenItinerary} />

      {/* Auth Prompt Dialog */}
      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={handleAuthPromptClose}
        onSkip={handleAuthPromptSkip}
      />

      {/* Itinerary Sheet */}
      <ItinerarySheet
        open={showItinerarySheet}
        onOpenChange={setShowItinerarySheet}
      />

      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground">
              Hello, I'm JC!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover amazing restaurants and excursions for your trip.
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <ChatInputArea placeholder="Where are you planning to visit?" />
            <div className="mt-6">
              <QuickActionsBar />
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatMessageList onOpenItinerary={handleOpenItinerary} />
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
            <div className="max-w-2xl mx-auto px-3 py-2">
              {/* Chat-style suggestion pills instead of buttons */}
              <ChatSuggestionPills 
                className="mb-2" 
                onOpenItinerary={handleOpenItinerary}
              />
            </div>
            <ChatInputArea placeholder="Ask about restaurants or activities..." className="border-t-0 pt-0" />
          </div>
        </>
      )}
    </div>
  );
}

const TripPlannerChat = () => {
  return (
    <PageTransition>
      <TripPlannerChatProvider>
        <ItineraryProvider>
          <TripPlannerChatContent />
        </ItineraryProvider>
      </TripPlannerChatProvider>
    </PageTransition>
  );
};

export default TripPlannerChat;
