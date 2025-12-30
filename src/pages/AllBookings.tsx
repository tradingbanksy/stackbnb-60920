import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import VendorBottomNav from "@/components/VendorBottomNav";
import { upcomingBookings } from "@/data/mockData";
import { useSmartBack } from "@/hooks/use-smart-back";

const AllBookings = () => {
  const goBack = useSmartBack("/vendor/dashboard");

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
          <h1 className="text-2xl font-bold">All Bookings</h1>
          <p className="text-sm text-muted-foreground">Complete list of your bookings</p>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
          {upcomingBookings.map((booking, index) => (
            <Card
              key={index}
              className="p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight">{booking.service}</h3>
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

      <VendorBottomNav />
    </div>
  );
};

export default AllBookings;
