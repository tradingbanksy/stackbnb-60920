"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Moon,
  Star,
  RotateCcw,
  CalendarDays,
  Check,
  Cloud,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { VendorLocationMap } from "@/components/VendorLocationMap";

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

interface HostVendor {
  id: number | string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  rating: number;
  description: string;
  duration?: string;
  maxGuests?: number;
  included?: string[];
}

// Helper to extract vendor name from a message with a booking link
function extractVendorFromMessage(content: string): string | null {
  // Look for booking link format: [Book VendorName Now →](/experience/ID)
  const bookingMatch = content.match(/\[Book\s+([^\]]+?)\s+Now\s*→?\]/i);
  if (bookingMatch) {
    return bookingMatch[1].trim();
  }
  
  // Look for "Great choice" confirmation with vendor name
  const greatChoiceMatch = content.match(/Great choice[^*]*\*\*([^*]+)\*\*/i);
  if (greatChoiceMatch) {
    return greatChoiceMatch[1].trim();
  }
  
  // Look for HOST'S PICK pattern
  const hostsPickMatch = content.match(/HOST'S PICK:\s*\*?\*?([^*\n]+)/i);
  if (hostsPickMatch) {
    return hostsPickMatch[1].trim();
  }
  
  // Look for first bold text that looks like a venue name (not "Great choice" etc)
  const boldMatches = content.match(/\*\*([^*]+)\*\*/g);
  if (boldMatches) {
    for (const match of boldMatches) {
      const name = match.replace(/\*\*/g, '').trim();
      // Skip common non-venue phrases
      if (!name.match(/^(Great choice|What's Included|Pro Tips|Duration|Price)/i) && name.length > 2) {
        return name;
      }
    }
  }
  
  return null;
}

// Check if message contains a quote (booking link or price mention)
function hasQuoteInMessage(content: string): boolean {
  const hasBookingLink = /\[Book[^\]]*\]\(\/experience\//.test(content);
  const hasPriceMention = /\$\d+/.test(content) && /per person|total|price/i.test(content);
  // Also detect the styled booking summary format from the AI
  const hasBookingSummary = /✅\s*\*\*Great choice/.test(content) || /⏱️.*💰/.test(content);
  return hasBookingLink || hasPriceMention || hasBookingSummary;
}

// Check if any message in conversation has a booking confirmation
function hasBookingInConversation(messages: Message[]): boolean {
  return messages.some(m => m.role === "assistant" && hasQuoteInMessage(m.content));
}

interface TripPlannerChatUIProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearChat?: () => void;
  hostVendors?: HostVendor[];
  isAuthenticated?: boolean | null;
  isSaving?: boolean;
}

export default function TripPlannerChatUI({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  hostVendors = [],
  isAuthenticated,
  isSaving,
}: TripPlannerChatUIProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [message, setMessage] = useState("");
  const [bionicEnabled, setBionicEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleBack = () => {
    navigate('/appview');
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

  // Auto-scroll to bottom when messages change (including during streaming)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Also scroll when the last message content changes (for streaming)
  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (lastMessage?.role === "assistant") {
      scrollToBottom();
    }
  }, [lastMessage?.content, scrollToBottom]);

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
          {isAuthenticated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300",
                      isSaving 
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                        : "bg-green-500/10 text-green-600 dark:text-green-400"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <Cloud className="h-3 w-3 animate-pulse" />
                        <span className="animate-pulse">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        Saved
                      </>
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSaving ? "Saving chat history..." : "Chat history is saved to your account"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onClearChat && messages.length > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClearChat}
                    className="transition-colors"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/itinerary')}
                  className="transition-colors"
                >
                  <CalendarDays className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Itinerary</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
              {messages.map((m, i) => {
                const isQuoteMessage = m.role === "assistant" && hasQuoteInMessage(m.content);
                const vendorName = isQuoteMessage ? extractVendorFromMessage(m.content) : null;
                
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[85%] p-4 text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div
                        className={
                          m.role === "assistant"
                            ? "prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-p:leading-relaxed prose-ul:my-4 prose-ul:space-y-2 prose-li:my-1 prose-headings:mt-6 prose-headings:mb-3 prose-h2:text-base prose-h2:font-bold prose-strong:text-foreground [&>*+*]:mt-4 [&_ul]:pl-1 [&_li]:pl-0 prose-li:marker:text-primary whitespace-pre-line"
                            : ""
                        }
                      >
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              const text = String(children);
                              const isBookingLink = href?.startsWith('/experience/') && text.includes('Book');
                              
                              if (isBookingLink) {
                                return (
                                  <Link
                                    to={href || '#'}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 mt-3 mb-1 rounded-full font-medium text-sm no-underline
                                      bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400
                                      text-white
                                      shadow-[0_4px_20px_rgba(168,85,247,0.4)]
                                      transition-all duration-300
                                      hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]
                                      hover:scale-105
                                      active:scale-95"
                                  >
                                    {text}
                                  </Link>
                                );
                              }
                              
                              // Regular links (like Google Maps ratings)
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {m.role === "assistant" && bionicEnabled 
                            ? applyBionicReading(m.content) 
                            : m.content}
                        </ReactMarkdown>
                      </div>
                    </Card>
                    
                    {/* Show map for quote messages */}
                    {isQuoteMessage && vendorName && (
                      <div className="w-full max-w-[85%] mt-3">
                        <VendorLocationMap vendorName={vendorName} />
                      </div>
                    )}
                  </div>
                );
              })}
              
              
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[85%] p-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Card>
                </div>
              )}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          {/* Input at Bottom */}
          <div className="p-4 border-t border-border">
            <div className="max-w-2xl mx-auto">
              {/* Quick response button above input - hide once a booking has been shown */}
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
