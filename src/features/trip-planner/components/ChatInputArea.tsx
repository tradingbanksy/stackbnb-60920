import { useState } from "react";
import { Loader2, ArrowUpIcon, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTripPlannerChatContext } from "../context";
import { useAutoResizeTextarea } from "../hooks";
import { hasBookingInConversation } from "../utils";

interface ChatInputAreaProps {
  variant?: "initial" | "chat";
}

export function ChatInputArea({ variant = "chat" }: ChatInputAreaProps) {
  const { messages, hostVendors, isLoading, sendMessage } = useTripPlannerChatContext();
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      sendMessage(message.trim());
      setMessage("");
      adjustHeight(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showHostRecommendation =
    variant === "chat" &&
    !isLoading &&
    messages.length > 1 &&
    messages[messages.length - 1]?.role === "assistant" &&
    !hasBookingInConversation(messages) &&
    hostVendors.length > 0;

  const isInitial = variant === "initial";

  return (
    <div className={cn(isInitial ? "" : "p-4 border-t border-border")}>
      <div className={cn(isInitial ? "w-full" : "max-w-2xl mx-auto")}>
        {showHostRecommendation && (
          <div className="flex justify-center mb-3">
            <button
              onClick={() => sendMessage("I'll go with the host's recommendation")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-foreground bg-muted/80 hover:bg-muted rounded-full border border-border/50 transition-colors"
            >
              <Star className="w-4 h-4 text-primary" />
              Go with Host's recommendation
            </button>
          </div>
        )}
        
        <div className="relative">
          {isInitial && (
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 rounded-xl blur-md opacity-70" />
          )}
          <div className={cn(
            "relative rounded-xl border border-border",
            isInitial ? "bg-card/90 backdrop-blur-md" : "bg-card/60 backdrop-blur-md"
          )}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={isInitial ? "Where are you planning to visit?" : "Ask about restaurants or activities..."}
              className={cn(
                "w-full px-4 py-3 resize-none border-none",
                "bg-transparent text-foreground text-sm",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground min-h-[48px]"
              )}
              style={{ overflow: "hidden" }}
            />

            <div className="flex items-center justify-end p-3">
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  message.trim() && !isLoading
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
