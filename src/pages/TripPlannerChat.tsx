import { useLocation } from "react-router-dom";
import TripPlannerChatUI from "@/components/ui/trip-planner-chat-ui";
import { PageTransition } from "@/components/PageTransition";
import { useTripPlannerChat } from "@/features/trip-planner";
import type { HostVendor } from "@/features/trip-planner";

const TripPlannerChat = () => {
  const location = useLocation();
  const passedVendors = (location.state as { hostVendors?: HostVendor[] })?.hostVendors || [];
  
  const {
    messages,
    isLoading,
    isSaving,
    isAuthenticated,
    hostVendors,
    sendMessage,
    clearChat,
  } = useTripPlannerChat({ initialVendors: passedVendors });

  return (
    <PageTransition>
      <TripPlannerChatUI
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onClearChat={clearChat}
        hostVendors={hostVendors}
        isAuthenticated={isAuthenticated}
        isSaving={isSaving}
      />
    </PageTransition>
  );
};

export default TripPlannerChat;
