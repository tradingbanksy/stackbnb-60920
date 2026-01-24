import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Home, MapPin, Utensils, Calendar } from "lucide-react";
import { useTripPlannerChatContext } from "../context/TripPlannerChatContext";
import { useItineraryContext } from "../context/ItineraryContext";

interface SuggestionPill {
  icon: React.ReactNode;
  label: string;
  prompt?: string;
  action?: "openItinerary";
  variant?: "primary" | "secondary";
}

// Context-aware suggestions based on conversation state
function getSuggestions(
  messageCount: number,
  hasItineraryItems: boolean,
  destination: string | null
): SuggestionPill[] {
  // Initial state - conversational prompts
  if (messageCount <= 2) {
    return [
      {
        icon: <Sparkles className="h-3.5 w-3.5" />,
        label: "Suggest activities",
        prompt: "What are the top activities you'd recommend for my trip? Show me 2-3 great options with full details.",
        variant: "primary",
      },
      {
        icon: <Home className="h-3.5 w-3.5" />,
        label: "Host's favorites",
        prompt: "Show me my host's favorite experiences. I'd like to see what they recommend for guests.",
        variant: "secondary",
      },
    ];
  }

  const suggestions: SuggestionPill[] = [];

  // If user has items in itinerary, show view option prominently
  if (hasItineraryItems) {
    suggestions.push({
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: "View itinerary",
      action: "openItinerary",
      variant: "primary",
    });
  }

  // More discovery suggestions
  suggestions.push({
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "More activities",
    prompt: "Show me more activity options with full details. What else do you recommend?",
    variant: hasItineraryItems ? "secondary" : "primary",
  });

  suggestions.push({
    icon: <Utensils className="h-3.5 w-3.5" />,
    label: "Best restaurants",
    prompt: "What are the must-try restaurants? Show me 2-3 top picks with details.",
  });

  suggestions.push({
    icon: <MapPin className="h-3.5 w-3.5" />,
    label: "Hidden gems",
    prompt: "What hidden gems should I not miss? Show me unique local experiences.",
  });

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
  const { itinerary } = useItineraryContext();
  
  const detectedDestination = useMemo(() => detectDestination(messages), [messages]);
  const hasItineraryItems = itinerary?.days.some(day => day.items.length > 0) ?? false;
  
  const suggestions = useMemo(() => {
    return getSuggestions(messages.length, hasItineraryItems, detectedDestination);
  }, [messages.length, hasItineraryItems, detectedDestination]);

  const handleClick = useCallback((suggestion: SuggestionPill) => {
    if (isLoading) return;
    
    // Handle special actions
    if (suggestion.action === "openItinerary" && onOpenItinerary) {
      onOpenItinerary();
      return;
    }
    
    // Send the conversational prompt
    if (suggestion.prompt) {
      sendMessage(suggestion.prompt);
    }
  }, [isLoading, sendMessage, onOpenItinerary]);

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
