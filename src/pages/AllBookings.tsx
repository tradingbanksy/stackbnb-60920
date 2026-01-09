import { Card } from "@/components/ui/card";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import VendorBottomNav from "@/components/VendorBottomNav";
import { useSmartBack } from "@/hooks/use-smart-back";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const AllBookings = () => {
  const goBack = useSmartBack("/vendor/dashboard");
  const { user } = useAuthContext();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['vendorAllBookings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get vendor profile
      const { data: vendorProfile } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!vendorProfile) return [];

      // Fetch all bookings for this vendor
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('vendor_profile_id', vendorProfile.id)
        .order('booking_date', { ascending: false });

      return bookingsData?.map(b => ({
        id: b.id,
        service: b.experience_name,
        date: b.booking_date,
        time: b.booking_time,
        guests: b.guests,
        status: b.status,
        amount: b.total_amount,
        host: b.vendor_name || 'Direct Booking',
      })) || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

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
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
            </>
          ) : bookings.length === 0 ? (
            <Card className="p-6 text-center">
              <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No bookings yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Bookings will appear here once customers make reservations
              </p>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card
                key={booking.id}
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
                      <span className="font-medium">Guests:</span> {booking.guests}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Amount:</span> ${booking.amount?.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Source:</span> {booking.host}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === 'completed' 
                          ? 'bg-green-500/10 text-green-600' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <VendorBottomNav />
    </div>
  );
};

export default AllBookings;