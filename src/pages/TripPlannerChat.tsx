import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import TripPlannerChatUI from "@/components/ui/trip-planner-chat-ui";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";

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

const MAX_MESSAGE_LENGTH = 2000;
const CHAT_HISTORY_KEY = "tripPlannerChatHistory";

const TripPlannerChat = () => {
  const { toast } = useToast();
  const location = useLocation();
  const passedVendors = (location.state as { hostVendors?: HostVendor[] })?.hostVendors || [];
  const [hostVendors, setHostVendors] = useState<HostVendor[]>(passedVendors);
  
  // Fetch vendors from database if none passed via location state
  useEffect(() => {
    if (passedVendors.length === 0) {
      const fetchVendors = async () => {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('id, name, category, description, price_per_person, google_rating, duration, max_guests, included_items')
          .eq('is_published', true);
        
        if (!error && data) {
          const mapped: HostVendor[] = data.map((v) => ({
            id: v.id,
            name: v.name,
            category: v.category,
            vendor: v.name,
            price: v.price_per_person || 0,
            rating: v.google_rating || 4.5,
            description: v.description || '',
            duration: v.duration || undefined,
            maxGuests: v.max_guests || undefined,
            included: v.included_items || [],
          }));
          setHostVendors(mapped);
        }
      };
      fetchVendors();
    }
  }, [passedVendors.length]);
  
  const initialMessage = hostVendors.length > 0
    ? `🌴 Hi! I'm JC, your Tulum travel assistant. Your host has curated ${hostVendors.length} amazing local experiences for you. Ask me about cenotes, beach clubs, restaurants, or let me help you plan your perfect Tulum adventure.`
    : "🌴 Hi! I'm JC, your Tulum travel assistant. I know the best cenotes, beach clubs, tacos, and hidden gems in the area. What are you looking to experience during your stay?";

  // Load messages from sessionStorage or use initial message
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = sessionStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Invalid JSON, use default
      }
    }
    return [{ role: "assistant", content: initialMessage }];
  });
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    sessionStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([{ role: "assistant", content: initialMessage }]);
  };

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (trimmedInput: string) => {
    if (!trimmedInput || isLoading) return;

    if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: "Message too long",
        description: `Please limit your message to ${MAX_MESSAGE_LENGTH} characters.`,
        variant: "destructive",
      });
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmedInput }]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-planner-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: trimmedInput }],
          hostVendors: hostVendors.length > 0 ? hostVendors : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add a "thinking" delay before showing response
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      // Robust SSE parsing (handles partial lines/JSON across chunks)
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          const trimmed = line.trim();

          // Ignore keep-alives/comments/empty lines
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (!trimmed.startsWith("data:")) continue;

          const dataStr = trimmed.replace(/^data:\s*/, "").trim();
          if (dataStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const json = JSON.parse(dataStr);
            const content = json.choices?.[0]?.delta?.content as string | undefined;

            if (content) {
              // Strip inverted punctuation + ensure response starts with capital letter (no leading symbols)
              assistantText += content.replace(/[¡¿]/g, "");
              assistantText = assistantText.replace(/(^|\n)\s*[!]\s*(?=[A-Za-z])/g, "$1");
              // Ensure very first character is a capital letter (strip any leading non-letter symbols)
              assistantText = assistantText.replace(/^[^A-Za-z]+/, "");

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantText;
                return updated;
              });
            }
          } catch {
            // Put the line back and wait for more data (partial JSON)
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush (in case the stream ended without a trailing newline)
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          raw = raw.trim();
          if (!raw || raw.startsWith(":")) continue;
          if (!raw.startsWith("data:")) continue;
          const dataStr = raw.replace(/^data:\s*/, "").trim();
          if (!dataStr || dataStr === "[DONE]") continue;

          try {
            const json = JSON.parse(dataStr);
            const content = json.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content.replace(/[¡¿]/g, "");
              assistantText = assistantText.replace(/(^|\n)\s*[!]\s*(?=[A-Za-z])/g, "$1");
              assistantText = assistantText.replace(/^[^A-Za-z]+/, "");

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantText;
                return updated;
              });
            }
          } catch {
            // ignore leftovers
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === "assistant" && lastMessage.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <TripPlannerChatUI
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
        hostVendors={hostVendors}
      />
    </PageTransition>
  );
};

export default TripPlannerChat;
