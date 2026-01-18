import { PageTransition } from "@/components/PageTransition";
import { TripPlannerChatProvider, useTripPlannerChatContext } from "@/features/trip-planner/context";
import {
  ChatHeader,
  ChatMessageList,
  ChatInputArea,
  QuickActionsBar,
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
            <ChatInputArea variant="initial" />
            <div className="mt-6">
              <QuickActionsBar />
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatMessageList />
          <ChatInputArea variant="chat" />
        </>
      )}
    </div>
  );
}

const TripPlannerChat = () => {
  return (
    <PageTransition>
      <TripPlannerChatProvider>
        <TripPlannerChatContent />
      </TripPlannerChatProvider>
    </PageTransition>
  );
};

export default TripPlannerChat;
