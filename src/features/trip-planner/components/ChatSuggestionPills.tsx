import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Home, MapPin, Utensils, Coffee, Compass } from "lucide-react";
import { useTripPlannerChatContext } from "../context/TripPlannerChatContext";
import { useItineraryContext } from "../context/ItineraryContext";

interface SuggestionPill {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  variant?: "primary" | "secondary";
}

// Context-aware suggestions based on conversation state
function getSuggestions(
  messageCount: number,
  hasItinerary: boolean,
  destination: string | null
): SuggestionPill[] {
  // Initial state - generation options
  if (messageCount <= 2) {
    return [
      {
        icon: <Sparkles className="h-3.5 w-3.5" />,
        label: "Generate itinerary",
        prompt: "Create a complete day-by-day itinerary for my trip with all the details including times, durations, what's included, and what to bring.",
        variant: "primary",
      },
      {
        icon: <Home className="h-3.5 w-3.5" />,
        label: "Host's picks",
        prompt: "Show me your top recommended experiences that my host has curated for guests.",
        variant: "secondary",
      },
    ];
  }

  // After some conversation - contextual suggestions
  const suggestions: SuggestionPill[] = [];

  // Generation options (always available after enough context)
  suggestions.push({
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Generate itinerary",
    prompt: "Now create a complete day-by-day itinerary based on our conversation. Include times, durations, what's included, what to bring, and travel info between activities.",
    variant: "primary",
  });

  suggestions.push({
    icon: <Home className="h-3.5 w-3.5" />,
    label: "Host's picks",
    prompt: "Create an itinerary using only your host's top recommended experiences.",
    variant: "secondary",
  });

  // If itinerary exists, show modification suggestions
  if (hasItinerary) {
    suggestions.push({
      icon: <Coffee className="h-3.5 w-3.5" />,
      label: "Add rest day",
      prompt: "Add a relaxed rest day to my itinerary with optional activities.",
    });
    suggestions.push({
      icon: <Utensils className="h-3.5 w-3.5" />,
      label: "More local food",
      prompt: "Add more authentic local food experiences to my itinerary.",
    });
    suggestions.push({
      icon: <Compass className="h-3.5 w-3.5" />,
      label: "Make it more relaxed",
      prompt: "Adjust my itinerary to be more relaxed with fewer activities per day.",
    });
  } else {
    // Discovery suggestions
    suggestions.push({
      icon: <Utensils className="h-3.5 w-3.5" />,
      label: "Best restaurants",
      prompt: "What are the must-try restaurants and food experiences?",
    });
    suggestions.push({
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: "Hidden gems",
      prompt: "What hidden gems should I not miss?",
    });
  }

  return suggestions;
}

// Destination detection from messages
function detectDestination(messages: Array<{ role: string; content: string }>): string | null {
  const assistantMessages = messages.filter(m => m.role === "assistant");
  const combinedText = assistantMessages.map(m => m.content).join(" ");
  
  const patterns = [
    /(?:welcome to|visiting|trip to|traveling to|in)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|!|\?|$)/i,
    /\b(Tulum|Cancun|Playa del Carmen|Mexico|Miami|Paris|London|Tokyo|New York|Barcelona)\b/i,
  ];
  
  for (const pattern of patterns) {
    const match = combinedText.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

interface ChatSuggestionPillsProps {
  className?: string;
  onOpenItinerary?: () => void;
}

export function ChatSuggestionPills({ className, onOpenItinerary }: ChatSuggestionPillsProps) {
  const { messages, sendMessage, isLoading } = useTripPlannerChatContext();
  const { itinerary, generateItineraryFromChat } = useItineraryContext();
  
  const detectedDestination = useMemo(() => detectDestination(messages), [messages]);
  const hasItinerary = !!itinerary;
  
  const suggestions = useMemo(() => {
    return getSuggestions(messages.length, hasItinerary, detectedDestination);
  }, [messages.length, hasItinerary, detectedDestination]);

  const handleClick = useCallback((suggestion: SuggestionPill) => {
    if (isLoading) return;
    
    // Send the message - the AI will respond conversationally
    sendMessage(suggestion.prompt);
    
    // For "Generate itinerary" and "Host's picks", generate itinerary after AI responds
    // Do NOT navigate - keep everything in chat
    if (suggestion.label === "Generate itinerary" || suggestion.label === "Host's picks") {
      // Generate itinerary from existing messages (will include the new response when it arrives)
      // The itinerary context will pick up the new messages
      setTimeout(() => {
        generateItineraryFromChat(messages);
        // Open itinerary sheet when ready
        if (onOpenItinerary) {
          onOpenItinerary();
        }
      }, 2500); // Slight delay to let AI respond first
    }
  }, [isLoading, sendMessage, messages, generateItineraryFromChat, onOpenItinerary]);

  // Only show after some conversation
  const userMessageCount = messages.filter(m => m.role === "user").length;
  if (userMessageCount < 1) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-wrap gap-2 justify-center ${className ?? ""}`}
    >
      {suggestions.slice(0, 4).map((suggestion, index) => (
        <motion.button
          key={suggestion.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleClick(suggestion)}
          disabled={isLoading}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-200 disabled:opacity-50
            ${suggestion.variant === "primary"
              ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40"
              : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            }
          `}
        >
          {suggestion.icon}
          <span>{suggestion.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
