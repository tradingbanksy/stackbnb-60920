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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Corner shadow effects */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at top right, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 30%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div 
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at top left, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 30%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 30%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 30%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      
      {/* Logo */}
      <div className="mb-12">
        <img 
          src={stackdLogo} 
          alt="stackd logo" 
          className="h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 mx-auto"
          style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))' }}
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
