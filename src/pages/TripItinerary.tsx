import { ItineraryProvider, TripPlannerChatProvider } from "@/features/trip-planner/context";
import { ItineraryPage } from "@/features/trip-planner/components";

export default function TripItinerary() {
  return (
    <TripPlannerChatProvider>
      <ItineraryProvider>
        <ItineraryPage />
      </ItineraryProvider>
    </TripPlannerChatProvider>
  );
}
