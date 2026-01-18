import { PageTransition } from "@/components/PageTransition";
import { 
  TripPlannerChatProvider, 
  useTripPlannerChatContext,
  ItineraryProvider 
} from "@/features/trip-planner/context";
import {
  ChatHeader,
  ChatMessageList,
  ChatInputArea,
  QuickActionsBar,
  CreateItineraryButton,
} from "@/features/trip-planner/components";

function TripPlannerChatContent() {
  const { messages } = useTripPlannerChatContext();
  const hasMessages = messages.length > 1;

  return (
    <div className="relative w-full h-screen bg-background flex flex-col">
      <ChatHeader />

      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground">
              Hello, I'm JC!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover amazing restaurants and excursions for your trip.
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <ChatInputArea placeholder="Where are you planning to visit?" />
            <div className="mt-6">
              <QuickActionsBar />
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatMessageList />
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
            <div className="max-w-2xl mx-auto px-3 py-2">
              <div className="flex justify-center mb-2">
                <CreateItineraryButton />
              </div>
            </div>
            <ChatInputArea placeholder="Ask about restaurants or activities..." className="border-t-0 pt-0" />
          </div>
        </>
      )}
    </div>
  );
}

const TripPlannerChat = () => {
  return (
    <PageTransition>
      <TripPlannerChatProvider>
        <ItineraryProvider>
          <TripPlannerChatContent />
        </ItineraryProvider>
      </TripPlannerChatProvider>
    </PageTransition>
  );
};

export default TripPlannerChat;
