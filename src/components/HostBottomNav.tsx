import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const HostBottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/host/dashboard", 
      icon: LayoutDashboard 
    },
    { 
      name: "Vendors", 
      path: "/host/vendors", 
      icon: Users 
    },
    { 
      name: "Profile", 
      path: "/host/profile", 
      icon: UserCircle 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-[375px] mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 active:scale-90",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default HostBottomNav;
