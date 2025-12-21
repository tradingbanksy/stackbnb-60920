import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserPlus, Compass } from "lucide-react";
import stackdLogo from "@/assets/stackd-logo-new.png";

interface AppSplashProps {
  onSelect: (choice: "signup" | "explore") => void;
}

const AppSplash = ({ onSelect }: AppSplashProps) => {
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (value: string) => {
    setSelected(value);
    // Small delay for visual feedback before transitioning
    setTimeout(() => {
      onSelect(value as "signup" | "explore");
    }, 300);
  };

  return (
    <div className="min-h-screen h-screen w-screen flex justify-center overflow-hidden" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Phone Container - Centered & Constrained */}
      <div className="w-full max-w-[430px] h-full flex flex-col items-center justify-center px-8" style={{ backgroundColor: '#FAF9F6' }}>
        {/* Logo */}
        <img 
          src={stackdLogo} 
          alt="stackd" 
          className="h-48 w-48 mb-12 drop-shadow-lg" 
        />

        {/* Radio Button Options - Styled like search bar */}
        <div className="w-full max-w-[280px] space-y-4">
          <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-3">
            {/* Sign Up Option */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
              <Label
                htmlFor="signup"
                className={`relative flex items-center gap-3 bg-white/90 rounded-full border border-gray-200/50 backdrop-blur-sm px-5 py-4 cursor-pointer transition-all duration-200 ${
                  selected === "signup" 
                    ? "ring-2 ring-orange-500/50 border-orange-500/30" 
                    : "hover:bg-white"
                }`}
              >
                <RadioGroupItem value="signup" id="signup" className="border-orange-500 text-orange-500" />
                <UserPlus className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Sign Up</span>
              </Label>
            </div>

            {/* Explore Option */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
              <Label
                htmlFor="explore"
                className={`relative flex items-center gap-3 bg-white/90 rounded-full border border-gray-200/50 backdrop-blur-sm px-5 py-4 cursor-pointer transition-all duration-200 ${
                  selected === "explore" 
                    ? "ring-2 ring-purple-500/50 border-purple-500/30" 
                    : "hover:bg-white"
                }`}
              >
                <RadioGroupItem value="explore" id="explore" className="border-purple-600 text-purple-600" />
                <Compass className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Explore</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default AppSplash;
