"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Utensils,
  MapPin,
  Compass,
  Sun,
  Palmtree,
  Ship,
  Camera,
  Loader2,
  Star,
  ArrowUpIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

import {
  type Message,
  type HostVendor,
  type TripPlannerChatUIProps,
  useAutoResizeTextarea,
  hasBookingInConversation,
  QuickAction,
  ChatHeader,
  ChatMessage,
} from "@/features/trip-planner";

export default function TripPlannerChatUI({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  hostVendors = [],
  isAuthenticated,
  isSaving,
}: TripPlannerChatUIProps) {
  const [message, setMessage] = useState("");
  const [bionicEnabled, setBionicEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      adjustHeight(true);
    }
  };

  const handleQuickAction = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (lastMessage?.role === "assistant") {
      scrollToBottom();
    }
  }, [lastMessage?.content, scrollToBottom]);

  const hasMessages = messages.length > 1;

  return (
    <div className="relative w-full h-screen bg-background flex flex-col">
      <ChatHeader
        hasMessages={hasMessages}
        isAuthenticated={isAuthenticated}
        isSaving={isSaving}
        bionicEnabled={bionicEnabled}
        onBionicToggle={() => setBionicEnabled(!bionicEnabled)}
        onClearChat={onClearChat}
      />

      {!hasMessages ? (
        /* Initial State - Centered Title & Input */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground">
              Hello, I'm JC!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover amazing restaurants and excursions for your trip.
            </p>
          </div>

          {/* Input Box with Radiant Glow */}
          <div className="w-full max-w-2xl">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 rounded-xl blur-md opacity-70"></div>
              <div className="relative bg-card/90 backdrop-blur-md rounded-xl border border-border">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Where are you planning to visit?"
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

            {/* Quick Actions */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
              <QuickAction 
                icon={<Utensils className="w-4 h-4" />} 
                label="Top Restaurants" 
                onClick={() => handleQuickAction("What are the best restaurants to try?")}
              />
              <QuickAction 
                icon={<Compass className="w-4 h-4" />} 
                label="Excursions" 
                onClick={() => handleQuickAction("What excursions and activities do you recommend?")}
              />
              <QuickAction 
                icon={<Palmtree className="w-4 h-4" />} 
                label="Beach Activities" 
                onClick={() => handleQuickAction("What beach activities are available?")}
              />
              <QuickAction 
                icon={<Ship className="w-4 h-4" />} 
                label="Water Sports" 
                onClick={() => handleQuickAction("Tell me about water sports and boat tours")}
              />
              <QuickAction 
                icon={<Camera className="w-4 h-4" />} 
                label="Must-See Spots" 
                onClick={() => handleQuickAction("What are the must-see spots and attractions?")}
              />
              <QuickAction 
                icon={<Sun className="w-4 h-4" />} 
                label="Best Time to Visit" 
                onClick={() => handleQuickAction("When is the best time to visit?")}
              />
              <QuickAction 
                icon={<MapPin className="w-4 h-4" />} 
                label="Hidden Gems" 
                onClick={() => handleQuickAction("What hidden gems should I know about?")}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Chat State - Messages & Input at Bottom */
        <>
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.map((m, i) => (
                <ChatMessage
                  key={i}
                  message={m}
                  bionicEnabled={bionicEnabled}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[85%] p-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input at Bottom */}
          <div className="p-4 border-t border-border">
            <div className="max-w-2xl mx-auto">
              {/* Quick response button above input */}
              {!isLoading && 
               messages.length > 1 && 
               messages[messages.length - 1]?.role === "assistant" &&
               !hasBookingInConversation(messages) &&
               hostVendors.length > 0 && (
                <div className="flex justify-center mb-3">
                  <button
                    onClick={() => onSendMessage("I'll go with the host's recommendation")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-foreground bg-muted/80 hover:bg-muted rounded-full border border-border/50 transition-colors"
                  >
                    <Star className="w-4 h-4 text-primary" />
                    Go with Host's recommendation
                  </button>
                </div>
              )}
              <div className="relative bg-card/60 backdrop-blur-md rounded-xl border border-border">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about restaurants or activities..."
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
        </>
      )}
    </div>
  );
}
