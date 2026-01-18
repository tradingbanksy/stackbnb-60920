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

// ============================================
// Itinerary Extraction Utilities (pure functions)
// ============================================

import type { ItineraryItemCategory, ItineraryDay, ItineraryItem } from "../types";

export function extractDestination(text: string): string {
  const patterns = [
    /(?:welcome to|visiting|trip to|traveling to|in)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|!|\?|$)/i,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:is|has|offers|features)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  
  return "Your Trip";
}

export function extractDates(text: string): { startDate: string; endDate: string } {
  const today = new Date();
  const defaultStart = today.toISOString().split('T')[0];
  const defaultEnd = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const datePattern = /(\w+\s+\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?/;
  const match = text.match(datePattern);
  
  if (match) {
    return { startDate: defaultStart, endDate: defaultEnd };
  }
  
  return { startDate: defaultStart, endDate: defaultEnd };
}

export function categorizeActivity(text: string): ItineraryItemCategory {
  const lowerText = text.toLowerCase();
  
  if (/restaurant|food|eat|dining|breakfast|lunch|dinner|brunch|cafe|taco|pizza|sushi/i.test(lowerText)) {
    return "food";
  }
  if (/transport|taxi|uber|bus|flight|train|drive|airport|transfer/i.test(lowerText)) {
    return "transport";
  }
  if (/free time|rest|relax|leisure|optional/i.test(lowerText)) {
    return "free";
  }
  
  return "activity";
}

export function extractActivities(text: string): Array<{ title: string; description: string; category: ItineraryItemCategory }> {
  const activities: Array<{ title: string; description: string; category: ItineraryItemCategory }> = [];
  
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let match: RegExpExecArray | null;
  
  while ((match = boldPattern.exec(text)) !== null) {
    const title = match[1].trim();
    if (!/^(Great choice|What's Included|Pro Tips|Duration|Price|Note)/i.test(title) && title.length > 2) {
      activities.push({
        title,
        description: "",
        category: categorizeActivity(title),
      });
    }
  }
  
  const numberedPattern = /(?:^|\n)\s*\d+\.\s*\*?\*?([^*\n]+)/gm;
  while ((match = numberedPattern.exec(text)) !== null) {
    const title = match[1].trim();
    if (title.length > 3 && !activities.some(a => a.title === title)) {
      activities.push({
        title,
        description: "",
        category: categorizeActivity(title),
      });
    }
  }
  
  return activities;
}

export function generateDays(
  startDate: string,
  endDate: string,
  activities: Array<{ title: string; description: string; category: ItineraryItemCategory }>
): ItineraryDay[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  const days: ItineraryDay[] = [];
  const activitiesPerDay = Math.ceil(activities.length / dayCount) || 2;
  
  for (let i = 0; i < dayCount; i++) {
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toISOString().split('T')[0];
    
    const dayActivities = activities.slice(i * activitiesPerDay, (i + 1) * activitiesPerDay);
    const times = ["09:00", "12:00", "15:00", "18:00", "20:00"];
    
    const items: ItineraryItem[] = dayActivities.map((activity, idx) => ({
      time: times[idx % times.length],
      title: activity.title,
      description: activity.description,
      category: activity.category,
      isUserEdited: false,
      confidence: 0.7,
    }));
    
    days.push({
      date: dateStr,
      title: `Day ${i + 1}`,
      items,
    });
  }
  
  return days;
}
