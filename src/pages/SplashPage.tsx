import { Link } from "react-router-dom";
import { useState } from "react";
import stackdLogo from "@/assets/stackd-logo-new.png";
import Snowfall from "@/components/Snowfall";

const SplashPage = () => {
  const [shakeExplore, setShakeExplore] = useState(false);
  const [shakeSignup, setShakeSignup] = useState(false);

  const handleExploreClick = () => {
    setShakeExplore(true);
    setTimeout(() => setShakeExplore(false), 500);
  };

  const handleSignupClick = () => {
    setShakeSignup(true);
    setTimeout(() => setShakeSignup(false), 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <Snowfall />
      {/* Logo with Reflection */}
      <div className="mb-12 relative z-10">
        <img 
          src={stackdLogo} 
          alt="stackd logo" 
          className="h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 drop-shadow-2xl relative z-10" 
        />
        {/* Reflection to the right */}
        <img 
          src={stackdLogo} 
          alt="" 
          aria-hidden="true"
          className="absolute top-0 left-[85%] h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 transform scale-x-[-1] opacity-15 blur-[3px] z-0"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 80%)',
          }}
        />
      </div>

      {/* Buttons Container */}
      <div className="flex items-center gap-5">
        {/* Sign Up Button */}
        <Link
          to="/auth"
          onClick={handleSignupClick}
          className={`
            relative overflow-hidden px-10 py-3.5 rounded-full font-medium text-sm uppercase tracking-widest
            bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400
            text-white
            shadow-[0_4px_20px_rgba(168,85,247,0.4)]
            transition-all duration-300
            hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]
            hover:scale-105
            active:scale-95
            ${shakeSignup ? 'animate-shake' : ''}
          `}
        >
          Sign Up
        </Link>

        {/* Explore Button */}
        <Link
          to="/appview"
          onClick={handleExploreClick}
          className={`
            relative px-10 py-3.5 rounded-full font-medium text-sm uppercase tracking-widest
            bg-transparent
            text-foreground
            border-2 border-foreground/30
            transition-all duration-300
            hover:border-foreground/60
            hover:bg-foreground/5
            hover:scale-105
            active:scale-95
            ${shakeExplore ? 'animate-shake' : ''}
          `}
        >
          Explore
        </Link>
      </div>
    </div>
  );
};

export default SplashPage;
