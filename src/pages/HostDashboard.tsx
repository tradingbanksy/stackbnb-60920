import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CalendarCheck, Users, StarIcon, LogOut, TrendingUp, ArrowUpRight, Handshake, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HostBottomNav from "@/components/HostBottomNav";
import { dashboardStats, recentBookings } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

interface VendorWithCommission {
  id: string;
  name: string;
  category: string;
  commission_percentage: number | null;
  photos: string[] | null;
  google_rating: number | null;
}

const HostDashboard = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<VendorWithCommission[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  
  const iconMap = {
    DollarSign,
    Calendar: CalendarCheck,
    Users,
    Star: StarIcon,
  };

  useEffect(() => {
    fetchVendorsWithCommission();
  }, []);

  const fetchVendorsWithCommission = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id, name, category, commission_percentage, photos, google_rating')
        .eq('is_published', true)
        .not('commission_percentage', 'is', null)
        .order('commission_percentage', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setIsLoadingVendors(false);
    }
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
                <p className="text-sm text-white/80">Here's your performance today</p>
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
          {dashboardStats.map((stat) => {
            const Icon = iconMap[stat.icon as keyof typeof iconMap];
            
            // Define navigation routes for each stat
            const getNavigationRoute = () => {
              switch(stat.label) {
                case "Total Earnings":
                  return "/host/earnings";
                case "Bookings":
                  return "/host/bookings";
                case "Active Vendors":
                  return "/host/vendors/active";
                case "Avg Rating":
                  return "/host/ratings";
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

        {/* Recent Activity Section */}
        <div className="px-4 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">Recent Activity</h2>
            </div>
            <button 
              onClick={() => navigate('/host/bookings')}
              className="text-sm font-medium text-primary hover:text-primary/80 active:scale-95 flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentBookings.map((booking, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-95 group border-l-4 border-l-transparent hover:border-l-orange-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate group-hover:text-orange-500 transition-colors">
                      {booking.service}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-1">{booking.vendor}</p>
                    <p className="text-xs text-muted-foreground mt-2">{booking.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500">
                      <p className="font-bold text-sm text-white">{booking.amount}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Vendor Commission Rates Section */}
        <div className="px-4 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold">Partner Commissions</h2>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Earn commissions when you refer guests to these vendors
          </p>

          {isLoadingVendors ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <Card className="p-6 text-center">
              <Store className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No vendors with affiliate programs yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <Card
                  key={vendor.id}
                  className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-95 cursor-pointer group"
                  onClick={() => navigate(`/vendor/${vendor.id}?mode=host`)}
                >
                  <div className="flex items-center gap-3">
                    {/* Vendor Photo */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                      {vendor.photos && vendor.photos.length > 0 ? (
                        <img
                          src={vendor.photos[0]}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate group-hover:text-orange-500 transition-colors">
                        {vendor.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{vendor.category}</p>
                      {vendor.google_rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{vendor.google_rating}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Commission Badge */}
                    <div className="flex-shrink-0">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-3 py-1 font-bold">
                        {vendor.commission_percentage}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default HostDashboard;
