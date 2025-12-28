import { Link } from "react-router-dom";
import stackdLogo from "@/assets/stackd-logo-new.png";
import { Building2, Store } from "lucide-react";

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-6">
        <img
          src={stackdLogo}
          alt="stackd logo"
          className="h-32 w-32 sm:h-40 sm:w-40 mx-auto"
          style={{ filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))" }}
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 text-center">Choose your role.</h1>

      {/* Role Cards */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-2xl">
        {/* Host Card */}
        <Link
          to="/auth?role=host"
          className="group flex-1 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/50 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Host</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              List your property and connect with vendors to offer curated experiences to your guests.
            </p>
          </div>
        </Link>

        {/* Vendor Card */}
        <Link
          to="/auth?role=vendor"
          className="group flex-1 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-orange-500/50 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Vendor</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Offer your services and experiences to vacation rental guests through host partnerships.
            </p>
          </div>
        </Link>
      </div>

      {/* Back link */}
      <Link to="/" className="mt-10 text-muted-foreground text-sm hover:text-foreground transition-colors">
        ← Back to home
      </Link>
    </div>
  );
};

export default RoleSelection;
