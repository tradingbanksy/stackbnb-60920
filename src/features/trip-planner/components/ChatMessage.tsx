import { memo, useMemo, lazy, Suspense, useState, useRef, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "../types";
import { applyBionicReading, extractVendorFromMessage, hasQuoteInMessage } from "../utils";

const VendorLocationMap = lazy(() => 
  import("@/components/VendorLocationMap").then(m => ({ default: m.VendorLocationMap }))
);

interface ChatMessageProps {
  message: Message;
  bionicEnabled: boolean;
}

const BookingLink = memo(function BookingLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      to={href}
      className="inline-flex items-center gap-2 px-5 py-2.5 mt-3 mb-1 rounded-full font-medium text-sm no-underline
        bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400
        text-white
        shadow-[0_4px_20px_rgba(168,85,247,0.4)]
        transition-all duration-300
        hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]
        hover:scale-105
        active:scale-95"
      aria-label={`Book ${text}`}
    >
      {text}
    </Link>
  );
});

const ExternalLink = memo(function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
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
});

// Lazy-loaded map that only renders when visible
function LazyVendorMap({ vendorName }: { vendorName: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[85%] mt-3" style={{ minHeight: '200px' }}>
      {isVisible ? (
        <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" aria-label="Loading map" />}>
          <VendorLocationMap vendorName={vendorName} />
        </Suspense>
      ) : (
        <Skeleton className="h-48 w-full rounded-lg" aria-label="Loading map" />
      )}
    </div>
  );
}

export const ChatMessage = memo(function ChatMessage({ message, bionicEnabled }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  
  const isQuoteMessage = useMemo(
    () => isAssistant && hasQuoteInMessage(message.content),
    [isAssistant, message.content]
  );
  
  const vendorName = useMemo(
    () => isQuoteMessage ? extractVendorFromMessage(message.content) : null,
    [isQuoteMessage, message.content]
  );
  
  const formattedContent = useMemo(
    () => isAssistant && bionicEnabled ? applyBionicReading(message.content) : message.content,
    [isAssistant, bionicEnabled, message.content]
  );

  const markdownComponents = useMemo(() => ({
    a: ({ href, children }: { href?: string; children?: ReactNode }) => {
      const text = String(children);
      const isBookingLink = href?.startsWith('/experience/') && text.includes('Book');
      
      if (isBookingLink && href) {
        return <BookingLink href={href} text={text} />;
      }
      
      return <ExternalLink href={href || '#'}>{children}</ExternalLink>;
    },
  }), []);

  return (
    <article 
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
      aria-label={`${isUser ? "Your" : "Assistant"} message`}
    >
      <Card
        className={`max-w-[85%] p-4 text-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <div
          className={
            isAssistant
              ? "prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-p:leading-relaxed prose-ul:my-4 prose-ul:space-y-2 prose-li:my-1 prose-headings:mt-6 prose-headings:mb-3 prose-h2:text-base prose-h2:font-bold prose-strong:text-foreground [&>*+*]:mt-4 [&_ul]:pl-1 [&_li]:pl-0 prose-li:marker:text-primary whitespace-pre-line"
              : ""
          }
        >
          <ReactMarkdown components={markdownComponents}>
            {formattedContent}
          </ReactMarkdown>
        </div>
      </Card>
      
      {isQuoteMessage && vendorName && (
        <LazyVendorMap vendorName={vendorName} />
      )}
    </article>
  );
});
