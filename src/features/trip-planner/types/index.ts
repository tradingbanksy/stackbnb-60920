export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface HostVendor {
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

export interface TripPlannerChatUIProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearChat?: () => void;
  hostVendors?: HostVendor[];
  isAuthenticated?: boolean | null;
  isSaving?: boolean;
}

export interface UseTripPlannerChatOptions {
  initialVendors?: HostVendor[];
}

export interface UseTripPlannerChatReturn {
  messages: Message[];
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean | null;
  hostVendors: HostVendor[];
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

// ============================================
// Itinerary Data Model
// ============================================

export type ItineraryItemCategory = "food" | "activity" | "transport" | "free";

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  vendorId?: string;
  location?: string;
  bookingLink?: string;
  category: ItineraryItemCategory;
  /** Tracks if this item was manually edited by the user */
  isUserEdited?: boolean;
  /** Confidence score from generation (0-1), lower = candidate for regeneration */
  confidence?: number;
}

export interface ItineraryDay {
  date: string;
  title: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
}
