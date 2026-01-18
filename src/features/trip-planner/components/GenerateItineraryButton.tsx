import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripPlannerChatContext } from "../context/TripPlannerChatContext";
import { useItineraryContext } from "../context/ItineraryContext";
import { useToast } from "@/hooks/use-toast";

// Destination detection patterns
const DESTINATION_PATTERNS = [
  /(?:welcome to|visiting|trip to|traveling to|in)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|!|\?|$)/i,
  /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:is|has|offers|features)/,
  /\b(Tulum|Cancun|Playa del Carmen|Mexico|Miami|Paris|London|Tokyo|New York|Barcelona)\b/i,
];

function detectDestination(text: string): string | null {
  for (const pattern of DESTINATION_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

const GENERATE_ITINERARY_PROMPT = `Please create a complete day-by-day itinerary for my trip. For each activity, include:

1. **Time** (morning, afternoon, evening with specific times)
2. **Activity name and location**
3. **Duration** (how long the activity takes)
4. **What's Included** (what comes with this activity - equipment, guides, meals, etc.)
5. **What to Bring** (items visitors should bring - sunscreen, water, camera, etc.)
6. **Travel Info** (distance and travel time from previous activity)

Please format each day clearly with Day 1, Day 2, etc. and organize activities in a logical sequence considering travel times between locations.`;

export function GenerateItineraryButton() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { messages, sendMessage, isLoading } = useTripPlannerChatContext();
  const { generateItineraryFromChat } = useItineraryContext();
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if button should be visible - need at least some conversation
  const { shouldShow, destination } = useMemo(() => {
    const assistantMessages = messages.filter(m => m.role === "assistant");
    
    // Need at least 2 assistant messages to show button
    if (assistantMessages.length < 2) {
      return { shouldShow: false, destination: null };
    }
    
    // Check if destination is detected in any assistant message
    const combinedText = assistantMessages.map(m => m.content).join(" ");
    const detectedDestination = detectDestination(combinedText);
    
    return { 
      shouldShow: !!detectedDestination, 
      destination: detectedDestination 
    };
  }, [messages]);

  const handleGenerate = useCallback(async () => {
    if (isLoading || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Send the prompt to generate a full itinerary
      await sendMessage(GENERATE_ITINERARY_PROMPT);
      
      // Wait a moment for the response to be added to messages
      // Then generate the itinerary from the updated chat
      setTimeout(() => {
        // Get the latest messages including the AI response
        generateItineraryFromChat(messages);
        
        toast({
          title: "Itinerary Generated!",
          description: `Your ${destination || 'trip'} itinerary is ready to view and customize.`,
        });
        
        navigate("/trip-planner/itinerary");
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  }, [isLoading, isGenerating, sendMessage, generateItineraryFromChat, messages, destination, navigate, toast]);

  if (!shouldShow) {
    return null;
  }

  const buttonDisabled = isLoading || isGenerating;

  return (
    <Button
      variant="default"
      onClick={handleGenerate}
      disabled={buttonDisabled}
      aria-label="Generate full itinerary with AI"
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md transition-all"
    >
      {buttonDisabled ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            {isGenerating ? "Generating..." : "Please wait..."}
          </span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Generate Itinerary</span>
        </>
      )}
    </Button>
  );
}
