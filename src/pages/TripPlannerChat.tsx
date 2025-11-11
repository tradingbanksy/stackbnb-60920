import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const TripPlannerChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🌴 Hello! I'm JC, your AI travel assistant. I can help you discover amazing restaurants and excursions for your trip. Where are you planning to visit?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Always scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-planner-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

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
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantText;
                return updated;
              });
            }
          } catch (err) {
            console.warn("Skipping malformed chunk:", trimmed);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.role !== "assistant"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="max-w-[375px] mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/appview")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Trip Planner</h1>
          <div className="w-10" />
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] p-3 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] p-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about restaurants or activities..."
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerChat;
