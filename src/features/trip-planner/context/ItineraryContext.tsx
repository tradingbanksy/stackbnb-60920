import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { Message, Itinerary, ItineraryDay, ItineraryItem, ItineraryItemCategory } from "../types";

const ITINERARY_STORAGE_KEY = "tripPlannerItinerary";

interface ItineraryContextValue {
  itinerary: Itinerary | null;
  isGenerating: boolean;
  isSaving: boolean;
  generateItineraryFromChat: (messages: Message[]) => void;
  updateItinerary: (partialUpdate: Partial<Itinerary>) => void;
  updateDayItems: (dayIndex: number, items: ItineraryItem[]) => void;
  updateItem: (dayIndex: number, itemIndex: number, updates: Partial<ItineraryItem>) => void;
  removeItem: (dayIndex: number, itemIndex: number) => void;
  clearItinerary: () => void;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

interface ItineraryProviderProps {
  children: ReactNode;
}

// ============================================
// Extraction Utilities (pure functions)
// ============================================

function extractDestination(text: string): string {
  // Look for common destination patterns
  const patterns = [
    /(?:welcome to|visiting|trip to|traveling to|in)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|!|\?|$)/i,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:is|has|offers|features)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  
  return "Your Trip";
}

function extractDates(text: string): { startDate: string; endDate: string } {
  const today = new Date();
  const defaultStart = today.toISOString().split('T')[0];
  const defaultEnd = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Look for date mentions like "January 15" or "Jan 15-18"
  const datePattern = /(\w+\s+\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?/;
  const match = text.match(datePattern);
  
  if (match) {
    // For now, return defaults - date parsing would need more robust handling
    return { startDate: defaultStart, endDate: defaultEnd };
  }
  
  return { startDate: defaultStart, endDate: defaultEnd };
}

function categorizeActivity(text: string): ItineraryItemCategory {
  const lowerText = text.toLowerCase();
  
  if (/restaurant|food|eat|dining|breakfast|lunch|dinner|brunch|cafe|taco|pizza|sushi/i.test(lowerText)) {
    return "food";
  }
  if (/transport|taxi|uber|bus|flight|train|drive|airport|transfer/i.test(lowerText)) {
    return "transport";
  }
  if (/free time|rest|relax|leisure|optional/i.test(lowerText)) {
    return "free";
  }
  
  return "activity";
}

function extractActivities(text: string): Array<{ title: string; description: string; category: ItineraryItemCategory }> {
  const activities: Array<{ title: string; description: string; category: ItineraryItemCategory }> = [];
  
  // Look for bold items which often indicate recommendations
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let match: RegExpExecArray | null;
  
  while ((match = boldPattern.exec(text)) !== null) {
    const title = match[1].trim();
    // Skip common non-activity phrases
    if (!/^(Great choice|What's Included|Pro Tips|Duration|Price|Note)/i.test(title) && title.length > 2) {
      activities.push({
        title,
        description: "",
        category: categorizeActivity(title),
      });
    }
  }
  
  // Look for numbered lists
  const numberedPattern = /(?:^|\n)\s*\d+\.\s*\*?\*?([^*\n]+)/gm;
  while ((match = numberedPattern.exec(text)) !== null) {
    const title = match[1].trim();
    if (title.length > 3 && !activities.some(a => a.title === title)) {
      activities.push({
        title,
        description: "",
        category: categorizeActivity(title),
      });
    }
  }
  
  return activities;
}

function generateDays(
  startDate: string,
  endDate: string,
  activities: Array<{ title: string; description: string; category: ItineraryItemCategory }>
): ItineraryDay[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  const days: ItineraryDay[] = [];
  const activitiesPerDay = Math.ceil(activities.length / dayCount) || 2;
  
  for (let i = 0; i < dayCount; i++) {
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toISOString().split('T')[0];
    
    const dayActivities = activities.slice(i * activitiesPerDay, (i + 1) * activitiesPerDay);
    const times = ["09:00", "12:00", "15:00", "18:00", "20:00"];
    
    const items: ItineraryItem[] = dayActivities.map((activity, idx) => ({
      time: times[idx % times.length],
      title: activity.title,
      description: activity.description,
      category: activity.category,
    }));
    
    days.push({
      date: dateStr,
      title: `Day ${i + 1}`,
      items,
    });
  }
  
  return days;
}

// ============================================
// Provider Component
// ============================================

export function ItineraryProvider({ children }: ItineraryProviderProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const generateItineraryFromChat = useCallback((messages: Message[]) => {
    setIsGenerating(true);
    
    // Process in next tick to allow UI to update
    setTimeout(() => {
      try {
        // Extract only assistant messages
        const assistantMessages = messages.filter(m => m.role === "assistant");
        const combinedText = assistantMessages.map(m => m.content).join("\n\n");
        
        // Extract components
        const destination = extractDestination(combinedText);
        const { startDate, endDate } = extractDates(combinedText);
        const activities = extractActivities(combinedText);
        const days = generateDays(startDate, endDate, activities);
        
        const newItinerary: Itinerary = {
          id: crypto.randomUUID(),
          destination,
          startDate,
          endDate,
          days,
        };
        
        setItinerary(newItinerary);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
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
        newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
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

  const value: ItineraryContextValue = {
    itinerary,
    isGenerating,
    isSaving,
    generateItineraryFromChat,
    updateItinerary,
    updateDayItems,
    updateItem,
    removeItem,
    clearItinerary,
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
