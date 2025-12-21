import { useState } from "react";
import stackdLogo from "@/assets/stackd-logo-new.png";

interface AppSplashProps {
  onSelect: (choice: "signup" | "explore") => void;
}

const AppSplash = ({ onSelect }: AppSplashProps) => {
  const [shaking, setShaking] = useState<"signup" | "explore" | null>(null);

  const handleClick = (choice: "signup" | "explore") => {
    setShaking(choice);
    setTimeout(() => {
      setShaking(null);
      onSelect(choice);
    }, 400);
  };

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

        {/* Button Options - Side by side */}
        <div className="flex gap-4">
          {/* Sign Up Button */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/40 to-purple-600/40 rounded-full blur-md"></div>
            <button
              onClick={() => handleClick("signup")}
              className={`relative bg-white/90 rounded-full border border-gray-200/50 backdrop-blur-sm px-6 py-3 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 ${
                shaking === "signup" ? "animate-[shake_0.4s_ease-in-out]" : ""
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Explore Button */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/40 to-purple-600/40 rounded-full blur-md"></div>
            <button
              onClick={() => handleClick("explore")}
              className={`relative bg-white/90 rounded-full border border-gray-200/50 backdrop-blur-sm px-6 py-3 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 ${
                shaking === "explore" ? "animate-[shake_0.4s_ease-in-out]" : ""
              }`}
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default AppSplash;
