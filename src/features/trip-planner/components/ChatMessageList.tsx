import { useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./ChatMessage";
import { useTripPlannerChatContext } from "../context";

export function ChatMessageList() {
  const { messages, isLoading, bionicEnabled } = useTripPlannerChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
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
  );
}
