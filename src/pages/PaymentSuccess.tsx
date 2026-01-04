import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, Users, Mail, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingData, guestData, clearBookingData } = useBooking();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Small delay to ensure booking data is available
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-[375px] mx-auto">
        {/* Progress Indicator */}
        <div className="bg-card border-b p-4">
          <div className="text-center text-sm text-muted-foreground mb-2">Payment Complete</div>
          <div className="flex gap-1">
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
          </div>
        </div>

        <div className="px-4 py-8 space-y-6">
          {/* Success Icon */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-scale-in">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your booking has been confirmed
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <Card className="p-5 space-y-4">
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">{bookingData.experienceName || "Experience Booked"}</h2>
              
              <div className="space-y-3 text-sm">
                {bookingData.date && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{bookingData.date}</p>
                    </div>
                  </div>
                )}

                {bookingData.time && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">{bookingData.time}</p>
                    </div>
                  </div>
                )}

                {bookingData.guests > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Guests</p>
                      <p className="text-muted-foreground">{bookingData.guests} {bookingData.guests === 1 ? 'person' : 'people'}</p>
                    </div>
                  </div>
                )}
              </div>

              {bookingData.totalPrice > 0 && (
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                      ${bookingData.totalPrice}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Email Confirmation */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Confirmation Email Sent</p>
                <p className="text-xs text-muted-foreground">
                  A confirmation email has been sent to <span className="font-medium">{user?.email || guestData.email}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              variant="gradient" 
              className="w-full" 
              size="lg"
              onClick={() => {
                clearBookingData();
                navigate('/appview');
              }}
            >
              Back to Experiences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
