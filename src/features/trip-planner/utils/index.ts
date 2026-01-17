import type { Message } from "../types";

export const CHAT_HISTORY_KEY = "tripPlannerChatHistory";
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * Bionic reading: bold first part of each word for improved readability
 */
export function applyBionicReading(text: string): string {
  return text.replace(/\b(\w+)\b/g, (word) => {
    if (word.length <= 1) return word;
    const boldLength = Math.ceil(word.length * 0.4);
    const boldPart = word.slice(0, boldLength);
    const rest = word.slice(boldLength);
    return `**${boldPart}**${rest}`;
  });
}

/**
 * Extract vendor name from a message with a booking link
 */
export function extractVendorFromMessage(content: string): string | null {
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

/**
 * Check if message contains a quote (booking link or price mention)
 */
export function hasQuoteInMessage(content: string): boolean {
  const hasBookingLink = /\[Book[^\]]*\]\(\/experience\//.test(content);
  const hasPriceMention = /\$\d+/.test(content) && /per person|total|price/i.test(content);
  // Also detect the styled booking summary format from the AI
  const hasBookingSummary = /✅\s*\*\*Great choice/.test(content) || /⏱️.*💰/.test(content);
  return hasBookingLink || hasPriceMention || hasBookingSummary;
}

/**
 * Check if any message in conversation has a booking confirmation
 */
export function hasBookingInConversation(messages: Message[]): boolean {
  return messages.some(m => m.role === "assistant" && hasQuoteInMessage(m.content));
}

/**
 * Generate initial greeting message based on vendor availability
 */
export function getInitialMessage(vendorCount: number): string {
  return vendorCount > 0
    ? `🌴 Hi! I'm JC, your Tulum travel assistant. Your host has curated ${vendorCount} amazing local experiences for you. Ask me about cenotes, beach clubs, restaurants, or let me help you plan your perfect Tulum adventure.`
    : "🌴 Hi! I'm JC, your Tulum travel assistant. I know the best cenotes, beach clubs, tacos, and hidden gems in the area. What are you looking to experience during your stay?";
}
