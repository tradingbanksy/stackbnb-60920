"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Utensils,
  MapPin,
  Compass,
  Sun,
  Palmtree,
  Ship,
  Camera,
  Sparkles,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Bionic reading: bold first part of each word
function applyBionicReading(text: string): string {
  return text.replace(/\b(\w+)\b/g, (word) => {
    if (word.length <= 1) return word;
    const boldLength = Math.ceil(word.length * 0.4);
    const boldPart = word.slice(0, boldLength);
    const rest = word.slice(boldLength);
    return `**${boldPart}**${rest}`;
  });
}

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TripPlannerChatUIProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export default function TripPlannerChatUI({
  messages,
  isLoading,
  onSendMessage,
}: TripPlannerChatUIProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [bionicEnabled, setBionicEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/appview');
    }
  };

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const hasMessages = messages.length > 1;

  return (
    <div className="relative w-full h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Trip Planner</h1>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setBionicEnabled(!bionicEnabled)}
                className={cn(
                  "transition-colors",
                  bionicEnabled && "text-primary"
                )}
              >
                {bionicEnabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{bionicEnabled ? "Disable" : "Enable"} Bionic Reading</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

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
              {/* Radiant glow effect */}
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
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <Card
                    className={`max-w-[85%] p-3 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div
                      className={
                        m.role === "assistant"
                          ? "prose prose-sm dark:prose-invert max-w-none prose-p:my-4 prose-ul:my-3 prose-li:my-1.5 prose-headings:mt-5 prose-headings:mb-3 prose-strong:text-foreground [&>*+*]:mt-4"
                          : ""
                      }
                    >
                      <ReactMarkdown>
                        {m.role === "assistant" && bionicEnabled 
                          ? applyBionicReading(m.content) 
                          : m.content}
                      </ReactMarkdown>
                    </div>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[85%] p-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input at Bottom */}
          <div className="p-4 border-t border-border">
            <div className="max-w-2xl mx-auto">
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

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-accent"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
