import { Link } from "react-router-dom";
import { useState } from "react";
import stackdLogo from "@/assets/stackd-logo-new.png";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12">
        <img 
          src={stackdLogo} 
          alt="stackd logo" 
          className="h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 drop-shadow-2xl mx-auto" 
        />
      </div>

      {/* Buttons Container */}
      <div className="flex items-center gap-4">
        {/* Sign Up Button */}
        <Link
          to="/auth"
          onClick={handleSignupClick}
          className={`
            relative overflow-hidden px-8 py-4 rounded-lg font-semibold text-base
            bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
            text-white shadow-lg
            border border-white/10
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
            hover:border-purple-400/50
            active:scale-95
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
            before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
            ${shakeSignup ? 'animate-shake' : ''}
          `}
        >
          <span className="relative z-10 tracking-wide">Sign Up</span>
        </Link>

        {/* Explore Button */}
        <Link
          to="/appview"
          onClick={handleExploreClick}
          className={`
            relative overflow-hidden px-8 py-4 rounded-lg font-semibold text-base
            bg-card/80 backdrop-blur-md
            text-foreground
            border border-border/50
            shadow-lg
            transition-all duration-300
            hover:border-cyan-400/50
            hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]
            hover:bg-card
            active:scale-95
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-cyan-500/10 before:to-transparent
            before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
            ${shakeExplore ? 'animate-shake' : ''}
          `}
        >
          <span className="relative z-10 tracking-wide">Explore</span>
        </Link>
      </div>
    </div>
  );
};

export default SplashPage;
