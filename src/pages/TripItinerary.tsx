import { ItineraryProvider } from "@/features/trip-planner/context";
import { ItineraryPage } from "@/features/trip-planner/components";

export default function TripItinerary() {
  return (
    <ItineraryProvider>
      <ItineraryPage />
    </ItineraryProvider>
  );
}
