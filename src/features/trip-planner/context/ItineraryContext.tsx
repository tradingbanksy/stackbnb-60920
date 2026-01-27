import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message, Itinerary, ItineraryDay, ItineraryItem, ItineraryItemCategory } from "../types";
import { extractDestination, extractActivities, generateDays } from "../utils";
import type { ParsedActivity } from "../components/AddToItineraryButton";

const ITINERARY_STORAGE_KEY = "tripPlannerItinerary";

export type RegenerateMode = "full" | "improve";
export type GenerationError = {
  message: string;
  code: "NETWORK_ERROR" | "PARSE_ERROR" | "NO_DATA" | "UNKNOWN";
  retryable: boolean;
};

// Parse trip dates from chat messages
function extractTripDatesFromMessages(messages: Message[]): { 
  startDate: string; 
  endDate: string; 
  destination: string;
  numDays: number;
} {
  const today = new Date();
  const defaultStart = today.toISOString().split('T')[0];
  const defaultEnd = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Combine all messages for parsing
  const allText = messages.map(m => m.content).join("\n");
  
  // Try to extract destination
  const destination = extractDestination(allText) || "Tulum";
  
  // Try to find date patterns in user messages
  // Patterns: "January 22-25", "Jan 22 - Jan 25", "22-25 January", "4 days", "3 nights"
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content).join("\n");
  const assistantMessages = messages.filter(m => m.role === "assistant").map(m => m.content).join("\n");
  
  // Look for explicit date mentions like "January 22-25" or "Jan 22 - 25"
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const monthAbbrev = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  
  // Pattern: Month DD-DD or Month DD - Month DD
  const dateRangePattern = new RegExp(
    `(${monthNames.join("|")}|${monthAbbrev.join("|")})\\s*(\\d{1,2})(?:\\s*[-–]\\s*(\\d{1,2}))?(?:\\s*(?:to|-)\\s*(${monthNames.join("|")}|${monthAbbrev.join("|")})?\\s*(\\d{1,2}))?`,
    "i"
  );
  
  const dateMatch = (userMessages + " " + assistantMessages).match(dateRangePattern);
  
  // Look for "X days" or "X nights" patterns
  const daysPattern = /(\d+)\s*(?:days?|nights?)/i;
  const daysMatch = (userMessages + " " + assistantMessages).match(daysPattern);
  
  let numDays = 4; // Default
  let startDate = defaultStart;
  let endDate = defaultEnd;
  
  if (daysMatch) {
    numDays = parseInt(daysMatch[1], 10);
    if (numDays < 1) numDays = 1;
    if (numDays > 14) numDays = 14;
  }
  
  if (dateMatch) {
    const monthStr = dateMatch[1].toLowerCase();
    const startDay = parseInt(dateMatch[2], 10);
    let endDay = dateMatch[3] ? parseInt(dateMatch[3], 10) : (dateMatch[5] ? parseInt(dateMatch[5], 10) : startDay + numDays - 1);
    
    // Find month index
    let monthIndex = monthNames.indexOf(monthStr);
    if (monthIndex === -1) {
      monthIndex = monthAbbrev.indexOf(monthStr);
    }
    
    if (monthIndex !== -1) {
      // Use current or next year
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;
      
      const parsedStart = new Date(year, monthIndex, startDay);
      const parsedEnd = new Date(year, monthIndex, endDay);
      
      if (!isNaN(parsedStart.getTime())) {
        startDate = parsedStart.toISOString().split('T')[0];
      }
      if (!isNaN(parsedEnd.getTime())) {
        endDate = parsedEnd.toISOString().split('T')[0];
      }
      
      // Recalculate numDays from actual dates
      numDays = Math.max(1, Math.ceil((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }
  } else if (daysMatch) {
    // No specific dates but we have a duration - use today as start
    const endDateObj = new Date(today.getTime() + (numDays - 1) * 24 * 60 * 60 * 1000);
    endDate = endDateObj.toISOString().split('T')[0];
  }
  
  return { startDate, endDate, destination, numDays };
}

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
  /** Sync destination + dates from chat without regenerating items */
  syncTripFromChat: (messages: Message[]) => void;
  generateItineraryFromChat: (messages: Message[], mode?: RegenerateMode) => void;
  retryGeneration: () => void;
  clearError: () => void;
  updateItinerary: (partialUpdate: Partial<Itinerary>) => void;
  updateDayItems: (dayIndex: number, items: ItineraryItem[]) => void;
  updateItem: (dayIndex: number, itemIndex: number, updates: Partial<ItineraryItem>) => void;
  removeItem: (dayIndex: number, itemIndex: number) => void;
  addActivityToItinerary: (activity: ParsedActivity, dayIndex?: number, messages?: Message[]) => void;
  setTripDates: (startDate: string, endDate: string, destination?: string) => void;
  confirmItinerary: () => void;
  unconfirmItinerary: () => void;
  clearItinerary: () => void;
  generateShareLink: () => Promise<string | null>;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

interface ItineraryProviderProps {
  children: ReactNode;
  messages?: Message[];
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
        // Extract assistant messages for activities (but dates/destination can be in either role)
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

        // Extract dates + destination from the full conversation (user + assistant)
        const { startDate, endDate, destination } = extractTripDatesFromMessages(messages);

        // Extract activities from assistant content
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

  // Sync destination + dates from chat (no regeneration)
  const syncTripFromChat = useCallback((messages: Message[]) => {
    if (!messages.length) return;
    const { startDate, endDate, destination } = extractTripDatesFromMessages(messages);

    setItinerary(prev => {
      // If no itinerary yet, create one with empty days
      if (!prev) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        const days: ItineraryDay[] = [];
        for (let i = 0; i < numDays; i++) {
          const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          days.push({
            date: dayDate.toISOString().split("T")[0],
            items: [],
          });
        }

        return {
          id: crypto.randomUUID(),
          destination,
          startDate,
          endDate,
          days,
        };
      }

      // If already matches, do nothing
      if (prev.startDate === startDate && prev.endDate === endDate && prev.destination === destination) {
        return prev;
      }

      // Reuse setTripDates behavior but preserve as much as possible via its date-matching logic
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      const newDays: ItineraryDay[] = [];
      const prevHasAnyItems = prev.days.some(d => d.items.length > 0);
      for (let i = 0; i < numDays; i++) {
        const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = dayDate.toISOString().split("T")[0];

        // Prefer keeping days by exact date match (best for small adjustments)
        const existingByDate = prev.days.find(d => d.date === dateStr);
        if (existingByDate) {
          newDays.push(existingByDate);
          continue;
        }

        // If dates changed significantly, preserve items by index so the user's plan doesn't disappear
        const existingByIndex = prevHasAnyItems ? prev.days[i] : undefined;
        if (existingByIndex) {
          newDays.push({
            ...existingByIndex,
            date: dateStr,
          });
          continue;
        }

        newDays.push({
          date: dateStr,
          items: [],
        });
      }

      return {
        ...prev,
        startDate,
        endDate,
        destination,
        days: newDays,
      };
    });
  }, []);

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

  // Set trip dates explicitly (can be called when dates are confirmed in chat)
  const setTripDates = useCallback((startDate: string, endDate: string, destination?: string) => {
    setItinerary(prev => {
      if (!prev) {
        // Create a new itinerary with the dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        
        const days: ItineraryDay[] = [];
        for (let i = 0; i < numDays; i++) {
          const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          days.push({
            date: dayDate.toISOString().split('T')[0],
            items: [],
          });
        }
        
        return {
          id: crypto.randomUUID(),
          destination: destination || "Tulum",
          startDate,
          endDate,
          days,
        };
      }
      
      // Update existing itinerary dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      // Rebuild days to match new date range
      const newDays: ItineraryDay[] = [];
      for (let i = 0; i < numDays; i++) {
        const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // Try to keep existing day data if date matches
        const existingDay = prev.days.find(d => d.date === dateStr);
        if (existingDay) {
          newDays.push(existingDay);
        } else {
          newDays.push({
            date: dateStr,
            items: [],
          });
        }
      }
      
      return {
        ...prev,
        startDate,
        endDate,
        destination: destination || prev.destination,
        days: newDays,
      };
    });
  }, []);

  // Add a single activity to the itinerary incrementally
  const addActivityToItinerary = useCallback((activity: ParsedActivity, dayIndex?: number, messages?: Message[]) => {
    setItinerary(prev => {
      // If no itinerary exists, create a new one with dates from chat
      if (!prev) {
        // Extract dates from chat messages if provided
        const chatMessages = messages || [];
        const { startDate, endDate, destination, numDays } = extractTripDatesFromMessages(chatMessages);
        
        // Create days based on extracted dates
        const days: ItineraryDay[] = [];
        const start = new Date(startDate);
        for (let i = 0; i < numDays; i++) {
          const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          days.push({
            date: dayDate.toISOString().split('T')[0],
            items: [],
          });
        }
        
        // Add the activity to the first day
        const newItem: ItineraryItem = {
          id: crypto.randomUUID(),
          title: activity.title,
          description: activity.description || "",
          time: activity.time || "09:00",
          duration: activity.duration,
          category: activity.category,
          location: activity.location,
          includes: activity.includes,
          whatToBring: activity.whatToBring,
          vendorId: activity.vendorId,
          bookingLink: activity.bookingLink,
          travelInfo: activity.travelInfo,
          isUserEdited: true,
          confidence: 1.0,
        };
        
        days[0].items.push(newItem);
        
        return {
          id: crypto.randomUUID(),
          destination,
          startDate,
          endDate,
          days,
        };
      }
      
      // Find which day to add to
      let targetDayIndex = dayIndex ?? 0;
      
      // If no specific day, find the first day with fewer than 4 items
      if (dayIndex === undefined) {
        const foundIndex = prev.days.findIndex(day => day.items.length < 4);
        targetDayIndex = foundIndex >= 0 ? foundIndex : 0;
      }
      
      // Calculate next available time slot
      const targetDay = prev.days[targetDayIndex];
      const existingTimes = targetDay?.items.map(item => item.time) || [];
      const timeSlots = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];
      const nextAvailableTime = timeSlots.find(t => !existingTimes.includes(t)) || activity.time || "12:00";
      
      const newItem: ItineraryItem = {
        id: crypto.randomUUID(),
        title: activity.title,
        description: activity.description || "",
        time: activity.time || nextAvailableTime,
        duration: activity.duration,
        category: activity.category,
        location: activity.location,
        includes: activity.includes,
        whatToBring: activity.whatToBring,
        vendorId: activity.vendorId,
        bookingLink: activity.bookingLink,
        travelInfo: activity.travelInfo,
        isUserEdited: true,
        confidence: 1.0,
      };
      
      const newDays = [...prev.days];
      if (newDays[targetDayIndex]) {
        newDays[targetDayIndex] = {
          ...newDays[targetDayIndex],
          items: [...newDays[targetDayIndex].items, newItem].sort((a, b) => a.time.localeCompare(b.time)),
        };
      }
      
      return { ...prev, days: newDays };
    });
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
    syncTripFromChat,
    generateItineraryFromChat,
    retryGeneration,
    clearError,
    updateItinerary,
    updateDayItems,
    updateItem,
    removeItem,
    addActivityToItinerary,
    setTripDates,
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
