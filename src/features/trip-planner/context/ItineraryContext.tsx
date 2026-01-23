import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message, Itinerary, ItineraryDay, ItineraryItem } from "../types";
import { extractDestination, extractDates, extractActivities, generateDays } from "../utils";

const ITINERARY_STORAGE_KEY = "tripPlannerItinerary";

export type RegenerateMode = "full" | "improve";
export type GenerationError = {
  message: string;
  code: "NETWORK_ERROR" | "PARSE_ERROR" | "NO_DATA" | "UNKNOWN";
  retryable: boolean;
};

interface ItineraryContextValue {
  itinerary: Itinerary | null;
  isGenerating: boolean;
  isSaving: boolean;
  isSharing: boolean;
  hasUserEdits: boolean;
  isConfirmed: boolean;
  shareUrl: string | null;
  generationError: GenerationError | null;
  lastMessages: Message[] | null;
  generateItineraryFromChat: (messages: Message[], mode?: RegenerateMode) => void;
  retryGeneration: () => void;
  clearError: () => void;
  updateItinerary: (partialUpdate: Partial<Itinerary>) => void;
  updateDayItems: (dayIndex: number, items: ItineraryItem[]) => void;
  updateItem: (dayIndex: number, itemIndex: number, updates: Partial<ItineraryItem>) => void;
  removeItem: (dayIndex: number, itemIndex: number) => void;
  confirmItinerary: () => void;
  unconfirmItinerary: () => void;
  clearItinerary: () => void;
  generateShareLink: () => Promise<string | null>;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

interface ItineraryProviderProps {
  children: ReactNode;
}

// ============================================
// Provider Component
// ============================================

export function ItineraryProvider({ children }: ItineraryProviderProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [generationError, setGenerationError] = useState<GenerationError | null>(null);
  const [lastMessages, setLastMessages] = useState<Message[] | null>(null);
  const [lastMode, setLastMode] = useState<RegenerateMode>("full");
  const hasInitialized = useRef(false);

  // Load from storage on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      const stored = localStorage.getItem(ITINERARY_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setItinerary(parsed);
        } catch {
          // Invalid JSON, ignore
        }
      }
      hasInitialized.current = true;
    }
  }, []);

  // Persist when itinerary changes
  useEffect(() => {
    if (hasInitialized.current && itinerary) {
      setIsSaving(true);
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(itinerary));
      const timer = setTimeout(() => setIsSaving(false), 500);
      return () => clearTimeout(timer);
    }
  }, [itinerary]);

  const generateItineraryFromChat = useCallback((messages: Message[], mode: RegenerateMode = "full") => {
    setIsGenerating(true);
    setGenerationError(null);
    setLastMessages(messages);
    setLastMode(mode);
    
    // Process in next tick to allow UI to update
    setTimeout(() => {
      try {
        // Extract only assistant messages
        const assistantMessages = messages.filter(m => m.role === "assistant");
        
        if (assistantMessages.length === 0) {
          setGenerationError({
            message: "No trip information found. Please chat about your destination first.",
            code: "NO_DATA",
            retryable: false,
          });
          setIsGenerating(false);
          return;
        }
        
        const combinedText = assistantMessages.map(m => m.content).join("\n\n");
        
        // Extract components
        const destination = extractDestination(combinedText);
        
        if (!destination) {
          setGenerationError({
            message: "Couldn't detect a destination. Try mentioning a specific place like 'Tulum' or 'Cancún'.",
            code: "PARSE_ERROR",
            retryable: false,
          });
          setIsGenerating(false);
          return;
        }
        
        const { startDate, endDate } = extractDates(combinedText);
        const activities = extractActivities(combinedText);
        const newGeneratedDays = generateDays(startDate, endDate, activities);

        if (newGeneratedDays.length === 0) {
          setGenerationError({
            message: "Couldn't generate any days for your trip. Try asking for specific activities or recommendations.",
            code: "PARSE_ERROR",
            retryable: true,
          });
          setIsGenerating(false);
          return;
        }

        if (mode === "improve" && itinerary) {
          // Preserve user-edited items, only regenerate non-edited/low-confidence items
          const improvedDays = itinerary.days.map((existingDay, dayIndex) => {
            const newDayData = newGeneratedDays[dayIndex];
            
            // Keep all user-edited items
            const userEditedItems = existingDay.items.filter(item => item.isUserEdited);
            
            // Get non-edited items with low confidence that should be replaced
            const keepItems = existingDay.items.filter(
              item => item.isUserEdited || (item.confidence && item.confidence >= 0.8)
            );
            
            // Calculate how many new items we can add
            const usedTimes = new Set(keepItems.map(item => item.time));
            const availableNewItems = newDayData?.items.filter(
              item => !usedTimes.has(item.time)
            ) || [];
            
            // Merge: keep user items + high-confidence items + add new items for empty slots
            const mergedItems = [
              ...keepItems,
              ...availableNewItems.slice(0, Math.max(0, 4 - keepItems.length)),
            ].sort((a, b) => a.time.localeCompare(b.time));

            return {
              ...existingDay,
              items: mergedItems,
            };
          });

          setItinerary(prev => prev ? { ...prev, days: improvedDays } : prev);
        } else {
          // Full regenerate - create fresh itinerary
          const newItinerary: Itinerary = {
            id: crypto.randomUUID(),
            destination,
            startDate,
            endDate,
            days: newGeneratedDays,
          };
          
          setItinerary(newItinerary);
        }
        
        // Clear error on success
        setGenerationError(null);
      } catch (err) {
        console.error("Error generating itinerary:", err);
        setGenerationError({
          message: "Something went wrong while creating your itinerary. Please try again.",
          code: "UNKNOWN",
          retryable: true,
        });
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  }, [itinerary]);

  const retryGeneration = useCallback(() => {
    if (lastMessages) {
      generateItineraryFromChat(lastMessages, lastMode);
    }
  }, [lastMessages, lastMode, generateItineraryFromChat]);

  const clearError = useCallback(() => {
    setGenerationError(null);
  }, []);

  const updateItinerary = useCallback((partialUpdate: Partial<Itinerary>) => {
    setItinerary(prev => {
      if (!prev) return prev;
      return { ...prev, ...partialUpdate };
    });
  }, []);

  const updateDayItems = useCallback((dayIndex: number, items: ItineraryItem[]) => {
    setItinerary(prev => {
      if (!prev) return prev;
      const newDays = [...prev.days];
      if (newDays[dayIndex]) {
        newDays[dayIndex] = { ...newDays[dayIndex], items };
      }
      return { ...prev, days: newDays };
    });
  }, []);

  const updateItem = useCallback((dayIndex: number, itemIndex: number, updates: Partial<ItineraryItem>) => {
    setItinerary(prev => {
      if (!prev) return prev;
      const newDays = [...prev.days];
      if (newDays[dayIndex] && newDays[dayIndex].items[itemIndex]) {
        const newItems = [...newDays[dayIndex].items];
        // Mark as user-edited when updated
        newItems[itemIndex] = { 
          ...newItems[itemIndex], 
          ...updates, 
          isUserEdited: true,
          confidence: 1.0, // User edits have full confidence
        };
        newDays[dayIndex] = { ...newDays[dayIndex], items: newItems };
      }
      return { ...prev, days: newDays };
    });
  }, []);

  const removeItem = useCallback((dayIndex: number, itemIndex: number) => {
    setItinerary(prev => {
      if (!prev) return prev;
      const newDays = [...prev.days];
      if (newDays[dayIndex]) {
        const newItems = newDays[dayIndex].items.filter((_, idx) => idx !== itemIndex);
        newDays[dayIndex] = { ...newDays[dayIndex], items: newItems };
      }
      return { ...prev, days: newDays };
    });
  }, []);

  const clearItinerary = useCallback(() => {
    localStorage.removeItem(ITINERARY_STORAGE_KEY);
    setItinerary(null);
  }, []);

  const confirmItinerary = useCallback(() => {
    setItinerary(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isConfirmed: true,
        confirmedAt: new Date().toISOString(),
      };
    });
  }, []);

  const unconfirmItinerary = useCallback(() => {
    setItinerary(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isConfirmed: false,
        confirmedAt: undefined,
      };
    });
  }, []);

  const generateShareLink = useCallback(async (): Promise<string | null> => {
    if (!itinerary || !itinerary.isConfirmed) return null;
    
    // If we already have a share URL, return it
    if (itinerary.shareUrl) return itinerary.shareUrl;
    
    setIsSharing(true);
    
    try {
      // Generate a unique share token
      const shareToken = crypto.randomUUID();
      
      // Get current user (optional - works for both logged-in and anonymous)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || crypto.randomUUID();
      
      // Create shared itinerary record in database with full itinerary data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('shared_itineraries')
        .insert({
          share_token: shareToken,
          user_id: userId,
          title: `Trip to ${itinerary.destination}`,
          is_public: true,
          destination: itinerary.destination,
          start_date: itinerary.startDate,
          end_date: itinerary.endDate,
          itinerary_data: itinerary,
        } as any));

      if (error) {
        console.error('Error creating shared itinerary:', error);
        return null;
      }

      // Build share URL
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/${shareToken}`;

      // Update local itinerary with share info
      setItinerary(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          shareToken,
          shareUrl,
        };
      });

      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      return null;
    } finally {
      setIsSharing(false);
    }
  }, [itinerary]);

  // Check if any items have been user-edited
  const hasUserEdits = itinerary?.days.some(day => 
    day.items.some(item => item.isUserEdited)
  ) ?? false;

  // Check if itinerary is confirmed
  const isConfirmed = itinerary?.isConfirmed ?? false;

  // Get share URL from itinerary
  const shareUrl = itinerary?.shareUrl ?? null;

  const value: ItineraryContextValue = {
    itinerary,
    isGenerating,
    isSaving,
    isSharing,
    hasUserEdits,
    isConfirmed,
    shareUrl,
    generationError,
    lastMessages,
    generateItineraryFromChat,
    retryGeneration,
    clearError,
    updateItinerary,
    updateDayItems,
    updateItem,
    removeItem,
    confirmItinerary,
    unconfirmItinerary,
    clearItinerary,
    generateShareLink,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItineraryContext(): ItineraryContextValue {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error("useItineraryContext must be used within an ItineraryProvider");
  }
  return context;
}
