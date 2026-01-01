import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import TripPlannerChatUI from "@/components/ui/trip-planner-chat-ui";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HostVendor {
  id: number;
  name: string;
  category: string;
  vendor: string;
  price: number;
  rating: number;
  description: string;
}

const MAX_MESSAGE_LENGTH = 2000;

const TripPlannerChat = () => {
  const { toast } = useToast();
  const location = useLocation();
  const hostVendors = (location.state as { hostVendors?: HostVendor[] })?.hostVendors || [];
  
  const initialMessage = hostVendors.length > 0
    ? `🌴 Hola! I'm JC, your Tulum travel assistant. Your host has curated ${hostVendors.length} amazing local experiences for you! Ask me about cenotes, beach clubs, restaurants, or let me help you plan your perfect Tulum adventure.`
    : "🌴 Hola! I'm JC, your Tulum travel assistant. I know all the best cenotes, beach clubs, tacos, and hidden gems in the area. What are you looking to experience during your stay?";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: initialMessage,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
      await new Promise(resolve => setTimeout(resolve, 1200));

      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          if (trimmed === "data: [DONE]") continue;

          try {
            const json = JSON.parse(trimmed.slice(5).trim());
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              // Ensure double newlines for proper paragraph spacing
              const formattedText = assistantText.replace(/\n\n/g, '\n\n');
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = formattedText;
                return updated;
              });
            }
          } catch {
            // Skip malformed chunks silently
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
    <TripPlannerChatUI
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
    />
  );
};

export default TripPlannerChat;
