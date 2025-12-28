import { Link } from "react-router-dom";
import { useState } from "react";
import stackdLogo from "@/assets/stackd-logo-new.png";
import { Building2, Store } from "lucide-react";

const RoleSelection = () => {
  const [shakeHost, setShakeHost] = useState(false);
  const [shakeVendor, setShakeVendor] = useState(false);

  const handleHostClick = () => {
    setShakeHost(true);
    setTimeout(() => setShakeHost(false), 500);
  };

  const handleVendorClick = () => {
    setShakeVendor(true);
    setTimeout(() => setShakeVendor(false), 500);
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
      <div className="mb-8">
        <img 
          src={stackdLogo} 
          alt="stackd logo" 
          className="h-48 w-48 sm:h-56 sm:w-56 lg:h-64 lg:w-64 mx-auto"
          style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))' }}
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 text-center">
        Join as
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center">
        Select how you'd like to use stackd
      </p>

      {/* Role Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-5 w-full max-w-md">
        {/* Host Button */}
        <Link
          to="/auth?role=host"
          onClick={handleHostClick}
          className={`
            relative overflow-hidden w-full sm:w-1/2 px-8 py-6 rounded-2xl font-medium text-center
            bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400
            text-white
            shadow-[0_4px_20px_rgba(168,85,247,0.4)]
            transition-all duration-300
            hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]
            hover:scale-105
            active:scale-95
            ${shakeHost ? 'animate-shake' : ''}
          `}
        >
          <Building2 className="w-8 h-8 mx-auto mb-3" />
          <span className="text-lg font-semibold block">Host</span>
          <span className="text-xs opacity-80 block mt-1">List your property</span>
        </Link>

        {/* Vendor Button */}
        <Link
          to="/auth?role=vendor"
          onClick={handleVendorClick}
          className={`
            relative overflow-hidden w-full sm:w-1/2 px-8 py-6 rounded-2xl font-medium text-center
            bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400
            text-white
            shadow-[0_4px_20px_rgba(168,85,247,0.4)]
            transition-all duration-300
            hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]
            hover:scale-105
            active:scale-95
            ${shakeVendor ? 'animate-shake' : ''}
          `}
        >
          <Store className="w-8 h-8 mx-auto mb-3" />
          <span className="text-lg font-semibold block">Vendor</span>
          <span className="text-xs opacity-80 block mt-1">Offer your services</span>
        </Link>
      </div>

      {/* Back link */}
      <Link 
        to="/"
        className="mt-10 text-muted-foreground text-sm hover:text-foreground transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
};

export default RoleSelection;
