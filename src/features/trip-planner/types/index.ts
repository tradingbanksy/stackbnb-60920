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
  id?: string;
  time: string;
  title: string;
  description: string;
  vendorId?: string;
  location?: string;
  bookingLink?: string;
  category: ItineraryItemCategory;
  /** What's included in the activity */
  includes?: string[];
  /** What to bring for the activity */
  whatToBring?: string[];
  /** Duration of the activity */
  duration?: string;
  /** Distance from previous activity */
  distanceFromPrevious?: string;
  /** Travel time from previous activity */
  travelTimeFromPrevious?: string;
  /** Distance to next activity */
  distanceToNext?: string;
  /** Travel time to next activity */
  travelTimeToNext?: string;
  /** Travel info object */
  travelInfo?: {
    distance?: string;
    travelTime?: string;
  };
  /** Tracks if this item was manually edited by the user */
  isUserEdited?: boolean;
  /** Confidence score from generation (0-1), lower = candidate for regeneration */
  confidence?: number;
}

export interface ItineraryDay {
  date: string;
  title?: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  /** Whether the itinerary has been confirmed by the user */
  isConfirmed?: boolean;
  /** Timestamp when the itinerary was confirmed */
  confirmedAt?: string;
  /** Share token for public sharing */
  shareToken?: string;
  /** Full share URL */
  shareUrl?: string;
}
