import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CalendarDays,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Check,
  Cloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTripPlannerChatContext } from "../context";

export function ChatHeader() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { messages, isSaving, bionicEnabled, setBionicEnabled, clearChat } = useTripPlannerChatContext();

  const hasMessages = messages.length > 1;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/appview')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Trip Planner</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span 
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300",
                  isSaving 
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                    : "bg-green-500/10 text-green-600 dark:text-green-400"
                )}
              >
                {isSaving ? (
                  <>
                    <Cloud className="h-3 w-3 animate-pulse" />
                    <span className="animate-pulse">Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Saved
                  </>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaving ? "Saving chat history..." : "Chat history is saved to your account"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-1">
        {hasMessages && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/itinerary')}
                className="transition-colors"
              >
                <CalendarDays className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Itinerary</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setBionicEnabled(!bionicEnabled)}
                className={cn(
                  "transition-colors",
                  bionicEnabled && "text-primary"
                )}
              >
                {bionicEnabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{bionicEnabled ? "Disable" : "Enable"} Bionic Reading</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-colors"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
