import { useRef, useEffect, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, AlertCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ItineraryPreviewCard } from "./ItineraryPreviewCard";
import { useTripPlannerChatContext } from "../context";
import { useItineraryContext } from "../context/ItineraryContext";
import type { StreamingStatus } from "../context/TripPlannerChatContext";

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Assistant is typing">
      <Card className="max-w-[85%] p-3 bg-muted">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
        </div>
      </Card>
    </div>
  );
});

interface StreamingBannerProps {
  status: StreamingStatus;
  onRetry: () => void;
}

const StreamingBanner = memo(function StreamingBanner({ status, onRetry }: StreamingBannerProps) {
  if (status === "idle") return null;

  if (status === "streaming") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/10 text-primary text-sm animate-pulse">
        <Clock className="w-4 h-4" />
        <span>Streaming response...</span>
      </div>
    );
  }

  if (status === "slow") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
        <Clock className="w-4 h-4 animate-spin" />
        <span>Still working... This is taking longer than usual.</span>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 px-4 rounded-lg bg-destructive/10 text-destructive">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Response timed out. The AI might be busy.</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  return null;
});

interface ChatMessageListProps {
  onOpenItinerary?: () => void;
}

export function ChatMessageList({ onOpenItinerary }: ChatMessageListProps) {
  const { messages, isLoading, bionicEnabled, streamingStatus, retryLastMessage } = useTripPlannerChatContext();
  const { itinerary, isGenerating, generationError } = useItineraryContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingStatus, itinerary, isGenerating, generationError]);

  // Filter out empty assistant messages when showing the timeout banner
  const displayMessages = messages.filter((msg, idx) => {
    // Keep all non-empty messages
    if (msg.content.trim()) return true;
    // Hide empty assistant placeholder when timeout
    if (msg.role === "assistant" && idx === messages.length - 1 && streamingStatus === "timeout") {
      return false;
    }
    return true;
  });

  // Only show itinerary preview when user has explicitly added items
  const hasUserAddedItems = itinerary?.days.some(day => day.items.length > 0) ?? false;
  const showItineraryPreview = hasUserAddedItems && onOpenItinerary;

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-2xl mx-auto" role="log" aria-live="polite">
        {displayMessages.map((message, index) => (
          <ChatMessage
            key={`${message.role}-${index}`}
            message={message}
            bionicEnabled={bionicEnabled}
          />
        ))}
        
        {/* Itinerary preview card - appears in chat flow */}
        {showItineraryPreview && (
          <div className="flex flex-col items-start">
            <ItineraryPreviewCard onExpand={onOpenItinerary} />
          </div>
        )}
        
        {isLoading && streamingStatus !== "timeout" && !isGenerating && (
          <>
            <TypingIndicator />
            <StreamingBanner status={streamingStatus} onRetry={retryLastMessage} />
          </>
        )}
        
        {streamingStatus === "timeout" && (
          <StreamingBanner status={streamingStatus} onRetry={retryLastMessage} />
        )}
        
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    </ScrollArea>
  );
}
