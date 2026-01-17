import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { VendorLocationMap } from "@/components/VendorLocationMap";
import type { Message } from "../types";
import { applyBionicReading, extractVendorFromMessage, hasQuoteInMessage } from "../utils";

interface ChatMessageProps {
  message: Message;
  bionicEnabled: boolean;
}

export function ChatMessage({ message, bionicEnabled }: ChatMessageProps) {
  const isQuoteMessage = message.role === "assistant" && hasQuoteInMessage(message.content);
  const vendorName = isQuoteMessage ? extractVendorFromMessage(message.content) : null;

  return (
    <div
      className={`flex flex-col ${
        message.role === "user" ? "items-end" : "items-start"
      }`}
    >
      <Card
        className={`max-w-[85%] p-4 text-sm ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div
          className={
            message.role === "assistant"
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
            {message.role === "assistant" && bionicEnabled 
              ? applyBionicReading(message.content) 
              : message.content}
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
}
