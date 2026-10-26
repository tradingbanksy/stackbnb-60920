import { Link } from "react-router-dom";
import { useState } from "react";
import Logo3DSpin from "@/components/Logo3DSpin";
import { ShieldCheck, Star, Zap } from "lucide-react";

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
      
      <main className="relative z-10 w-full max-w-xl flex flex-col items-center text-center py-10">
        {/* Animated 3D Logo */}
        <Logo3DSpin className="mb-6" desktopSize={220} mobileSize={150} />

        <h1 className="font-['Archivo_Black'] text-3xl md:text-5xl leading-tight">
          Book the best of{" "}
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Tulum
          </span>{" "}
          in one place
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-md">
          Discover and book curated Tulum experiences, restaurants and tours — all in one app.
        </p>

        {/* Primary CTA */}
        <Link
          to="/appview"
          onClick={handleExploreClick}
          className={`
            mt-8 w-full sm:w-auto px-12 py-4 rounded-full font-semibold text-sm uppercase tracking-widest
            bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white
            shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all duration-300
            hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95
            ${shakeExplore ? 'animate-shake' : ''}
          `}
        >
          Explore Tulum
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">No sign-in needed to browse.</p>

        {/* Sign-in entry */}
        <Link
          to="/auth"
          onClick={handleSignupClick}
          className={`mt-4 text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 ${shakeSignup ? 'animate-shake' : ''}`}
        >
          Sign up or sign in
        </Link>

        {/* Guest value props */}
        <ul className="mt-10 w-full grid gap-3 sm:grid-cols-3 text-left">
          {[
            { icon: ShieldCheck, title: "Curated & vetted", text: "Hand-picked local experiences you can trust." },
            { icon: Star, title: "Real reviews", text: "Ratings from guests who actually went." },
            { icon: Zap, title: "Book in a few taps", text: "Reserve tours, tables and activities fast." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-border bg-card/60 p-4">
              <Icon className="h-5 w-5 text-primary mb-2" aria-hidden />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{text}</p>
            </li>
          ))}
        </ul>

        {/* Secondary: hosts & vendors */}
        <div className="mt-10 w-full border-t border-border pt-6 flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/for-hosts" className="hover:text-foreground transition-colors">
            Are you a host? <span className="font-medium text-foreground underline underline-offset-4">Share stackd with your guests</span>
          </Link>
          <Link to="/for-vendors" className="hover:text-foreground transition-colors">
            Run experiences in Tulum? <span className="font-medium text-foreground underline underline-offset-4">List with stackd</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SplashPage;
