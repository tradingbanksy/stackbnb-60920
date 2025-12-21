import { Button } from "@/components/ui/button";
import stackdLogo from "@/assets/stackd-logo-new.png";

interface AppSplashProps {
  onSelect: (choice: "signup" | "explore") => void;
}

const AppSplash = ({ onSelect }: AppSplashProps) => {
  return (
    <div className="min-h-screen h-screen w-screen flex justify-center overflow-hidden" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Phone Container - Centered & Constrained */}
      <div className="w-full max-w-[430px] h-full flex flex-col items-center justify-center px-8" style={{ backgroundColor: '#FAF9F6' }}>
        {/* Logo - Double size */}
        <img 
          src={stackdLogo} 
          alt="stackd" 
          className="h-96 w-96 mb-12 drop-shadow-lg" 
        />

        {/* Button Options - Styled like search bar */}
        <div className="w-full max-w-[280px] space-y-3">
          {/* Sign Up Button */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
            <button
              onClick={() => onSelect("signup")}
              className="relative w-full bg-white/90 rounded-full border border-gray-200/50 backdrop-blur-sm px-5 py-4 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200"
            >
              Sign Up
            </button>
          </div>

          {/* Explore Button */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
            <button
              onClick={() => onSelect("explore")}
              className="relative w-full bg-white/90 rounded-full border border-gray-200/50 backdrop-blur-sm px-5 py-4 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200"
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSplash;
