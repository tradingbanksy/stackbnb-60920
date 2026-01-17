import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Message, HostVendor, UseTripPlannerChatOptions, UseTripPlannerChatReturn } from "../types";
import { CHAT_HISTORY_KEY, MAX_MESSAGE_LENGTH, getInitialMessage } from "../utils";

export function useTripPlannerChat(options: UseTripPlannerChatOptions = {}): UseTripPlannerChatReturn {
  const { initialVendors = [] } = options;
  const { toast } = useToast();
  
  const [hostVendors, setHostVendors] = useState<HostVendor[]>(initialVendors);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasInitialized = useRef(false);
  
  const initialMessage = getInitialMessage(hostVendors.length);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: initialMessage }]);

  // Fetch vendors from database if none passed
  useEffect(() => {
    if (initialVendors.length === 0) {
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
  }, [initialVendors.length]);

  // Check auth status and load history only for authenticated users
  useEffect(() => {
    const checkAuthAndLoadHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isLoggedIn = !!session?.user;
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn && !hasInitialized.current) {
        const stored = localStorage.getItem(CHAT_HISTORY_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
            }
          } catch {
            // Invalid JSON, use default
          }
        }
      } else if (!isLoggedIn) {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        sessionStorage.removeItem(CHAT_HISTORY_KEY);
      }
      
      hasInitialized.current = true;
    };
    
    checkAuthAndLoadHistory();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session?.user;
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn) {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        sessionStorage.removeItem(CHAT_HISTORY_KEY);
        setMessages([{ role: "assistant", content: initialMessage }]);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [initialMessage]);

  // Persist messages to localStorage only for authenticated users
  useEffect(() => {
    if (isAuthenticated && hasInitialized.current && messages.length > 1) {
      setIsSaving(true);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      const timer = setTimeout(() => setIsSaving(false), 800);
      return () => clearTimeout(timer);
    }
  }, [messages, isAuthenticated]);

  const clearChat = useCallback(() => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    sessionStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([{ role: "assistant", content: initialMessage }]);
  }, [initialMessage]);

  const sendMessage = useCallback(async (trimmedInput: string) => {
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

      await new Promise((resolve) => setTimeout(resolve, 1200));

      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
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
  }, [isLoading, messages, hostVendors, toast]);

  return {
    messages,
    isLoading,
    isSaving,
    isAuthenticated,
    hostVendors,
    sendMessage,
    clearChat,
  };
}
