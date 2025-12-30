import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, Users, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect } from "react";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { bookingData, guestData } = useBooking();

  useEffect(() => {
    // Confetti or success animation could be added here
  }, []);

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-[375px] mx-auto">
        {/* Progress Indicator */}
        <div className="bg-card border-b p-4">
          <div className="text-center text-sm text-muted-foreground mb-2">Step 3 of 3</div>
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
              <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your experience has been successfully booked
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <Card className="p-5 space-y-4">
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">{bookingData.experienceName}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">{bookingData.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">{bookingData.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-muted-foreground">{bookingData.guests} {bookingData.guests === 1 ? 'person' : 'people'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Paid</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    ${bookingData.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vendor Info */}
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold">Vendor Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{bookingData.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">Available in confirmation email</span>
              </div>
            </div>
          </Card>

          {/* Email Confirmation */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Email Confirmation Sent</p>
                <p className="text-xs text-muted-foreground">
                  A confirmation email with all booking details has been sent to <span className="font-medium">{guestData.email}</span>
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
              onClick={() => navigate('/explore')}
            >
              Back to Experiences
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/explore')}
            >
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
