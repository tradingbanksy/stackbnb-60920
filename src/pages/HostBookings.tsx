import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import HostBottomNav from "@/components/HostBottomNav";
import { recentBookings } from "@/data/mockData";

const HostBookings = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        <Link 
          to="/host/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">All Bookings</h1>
          <p className="text-sm text-muted-foreground">Complete booking history</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
              <p className="text-2xl font-bold">{recentBookings.length}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold">
                ${recentBookings.reduce((sum, booking) => {
                  const amount = parseFloat(booking.amount.replace('$', ''));
                  return sum + amount;
                }, 0).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* All Bookings List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Booking History</h2>
          
          <div className="space-y-3">
            {recentBookings.map((booking, index) => (
              <Card
                key={index}
                className="p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold mb-1">{booking.service}</p>
                      <p className="text-sm text-muted-foreground">{booking.vendor}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        {booking.amount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{booking.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p className="text-xs font-medium text-green-600">Completed</p>
                    </div>
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

export default HostBookings;
