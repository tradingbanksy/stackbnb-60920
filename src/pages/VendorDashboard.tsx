import { Card } from "@/components/ui/card";
import { DollarSign, CalendarCheck, Users, StarIcon, LogOut, TrendingUp, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VendorBottomNav from "@/components/VendorBottomNav";
import { vendorDashboardStats, upcomingBookings } from "@/data/mockData";

const VendorDashboard = () => {
  const navigate = useNavigate();
  
  const iconMap = {
    DollarSign,
    Calendar: CalendarCheck,
    Users,
    Star: StarIcon,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      <div className="max-w-[375px] mx-auto">
        {/* Hero Header with Gradient */}
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 px-4 pt-6 pb-20 rounded-b-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-sm text-white/80">Your business overview today</p>
              </div>
              <button
                onClick={() => navigate('/signout')}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all active:scale-95"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Overlapping Hero */}
        <div className="px-4 -mt-12 relative z-20 space-y-3">
          {vendorDashboardStats.map((stat) => {
            const Icon = iconMap[stat.icon as keyof typeof iconMap];
            
            // Define navigation routes for each stat
            const getNavigationRoute = () => {
              switch(stat.label) {
                case "Total Revenue":
                  return "/vendor/revenue";
                case "Bookings":
                  return "/vendor/bookings";
                case "Active Hosts":
                  return "/vendor/hosts";
                case "Rating":
                  return "/vendor/ratings";
                default:
                  return null;
              }
            };
            
            const route = getNavigationRoute();
            const CardWrapper = route ? 'button' : 'div';
            
            return (
              <Card 
                key={stat.label} 
                className="p-5 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-card/80 backdrop-blur-sm border-2"
              >
                <CardWrapper
                  onClick={route ? () => navigate(route) : undefined}
                  className={route ? 'w-full text-left' : ''}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 ring-1 ring-orange-500/20">
                        <Icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    {route && (
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardWrapper>
              </Card>
            );
          })}
        </div>

        {/* Upcoming Bookings Section */}
        <div className="px-4 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">Upcoming Bookings</h2>
            </div>
            <button 
              onClick={() => navigate('/vendor/bookings')}
              className="text-sm font-medium text-primary hover:text-primary/80 active:scale-95 flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingBookings.map((booking, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-95 group border-l-4 border-l-transparent hover:border-l-orange-500"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base leading-tight group-hover:text-orange-500 transition-colors">{booking.service}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{booking.date}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Time:</span> {booking.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Guest:</span> {booking.guest}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Host:</span> {booking.host}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <VendorBottomNav />
    </div>
  );
};

export default VendorDashboard;
