import {
  Utensils,
  MapPin,
  Compass,
  Sun,
  Palmtree,
  Ship,
  Camera,
} from "lucide-react";
import { QuickAction } from "./QuickAction";
import { useTripPlannerChatContext } from "../context";

const quickActions = [
  { icon: <Utensils className="w-4 h-4" />, label: "Top Restaurants", prompt: "What are the best restaurants to try?" },
  { icon: <Compass className="w-4 h-4" />, label: "Excursions", prompt: "What excursions and activities do you recommend?" },
  { icon: <Palmtree className="w-4 h-4" />, label: "Beach Activities", prompt: "What beach activities are available?" },
  { icon: <Ship className="w-4 h-4" />, label: "Water Sports", prompt: "Tell me about water sports and boat tours" },
  { icon: <Camera className="w-4 h-4" />, label: "Must-See Spots", prompt: "What are the must-see spots and attractions?" },
  { icon: <Sun className="w-4 h-4" />, label: "Best Time to Visit", prompt: "When is the best time to visit?" },
  { icon: <MapPin className="w-4 h-4" />, label: "Hidden Gems", prompt: "What hidden gems should I know about?" },
];

export function QuickActionsBar() {
  const { sendMessage, isLoading } = useTripPlannerChatContext();

  const handleQuickAction = (prompt: string) => {
    if (!isLoading) {
      sendMessage(prompt);
    }
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-2">
      {quickActions.map((action) => (
        <QuickAction
          key={action.label}
          icon={action.icon}
          label={action.label}
          onClick={() => handleQuickAction(action.prompt)}
        />
      ))}
    </div>
  );
}
