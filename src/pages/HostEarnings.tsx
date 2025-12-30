import { Card } from "@/components/ui/card";
import { ArrowLeft, DollarSign, TrendingUp } from "lucide-react";
import HostBottomNav from "@/components/HostBottomNav";
import { useSmartBack } from "@/hooks/use-smart-back";

const earningsData = [
  { id: 1, service: "Sunset Yoga Session", vendor: "Ocean Breeze Wellness", amount: 120, bookings: 3, date: "Dec 15, 2024" },
  { id: 2, service: "Beach Volleyball Tournament", vendor: "Sandy Courts Sports", amount: 95, bookings: 2, date: "Dec 14, 2024" },
  { id: 3, service: "Surfing Lessons", vendor: "Wave Riders Academy", amount: 180, bookings: 4, date: "Dec 13, 2024" },
  { id: 4, service: "Poolside BBQ Experience", vendor: "Grill Masters Co.", amount: 150, bookings: 3, date: "Dec 12, 2024" },
  { id: 5, service: "Sunset Cruise", vendor: "Coastal Adventures", amount: 200, bookings: 5, date: "Dec 11, 2024" },
  { id: 6, service: "Private Chef Dinner", vendor: "Culinary Delights", amount: 102, bookings: 2, date: "Dec 10, 2024" },
];

const HostEarnings = () => {
  const goBack = useSmartBack("/host/dashboard");
  const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0);
  const totalBookings = earningsData.reduce((sum, item) => sum + item.bookings, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        <button 
          onClick={goBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Total Earnings</h1>
          <p className="text-sm text-muted-foreground">Detailed earnings breakdown</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-orange-500/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </div>
              <p className="text-2xl font-bold">${totalEarnings}</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </Card>
        </div>

        {/* Earnings List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Earnings History</h2>
          
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {earningsData.map((item) => (
              <Card
                key={item.id}
                className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-95"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight">{item.service}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.vendor}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        ${item.amount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span>{item.bookings} {item.bookings === 1 ? 'booking' : 'bookings'}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default HostEarnings;
