import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { bookingData } = useBooking();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get hostId from URL or booking context
  const hostId = searchParams.get('host') || bookingData.hostId;

  const handleStripeCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to complete your booking",
        variant: "destructive",
      });
      navigate(`/auth?redirect=/vendor/${id}/payment`);
      return;
    }

    if (!bookingData.experienceName || bookingData.totalPrice <= 0) {
      toast({
        title: "Booking error",
        description: "Invalid booking details. Please start over.",
        variant: "destructive",
      });
      navigate(`/vendor/${id}`);
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: {
          experienceName: bookingData.experienceName,
          vendorName: bookingData.vendorName,
          date: bookingData.date,
          time: bookingData.time,
          guests: bookingData.guests,
          totalPrice: bookingData.totalPrice,
          vendorId: id,
          hostId: hostId || null, // Pass hostId for commission split
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Payment error",
        description: error instanceof Error ? error.message : "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-[375px] mx-auto">
        {/* Progress Indicator */}
        <div className="bg-card border-b p-4">
          <div className="text-center text-sm text-muted-foreground mb-2">Step 2 of 3</div>
          <div className="flex gap-1">
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
            <div className="h-1 flex-1 bg-muted rounded-full" />
          </div>
        </div>

        {/* Header */}
        <div className="px-4 py-4 border-b bg-card">
          <Link 
            to={`/vendor/${id}/book`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Confirm & Pay</h1>
            <p className="text-sm text-muted-foreground">Review your booking and complete payment</p>
          </div>

          {/* Booking Summary */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium text-right max-w-[180px]">{bookingData.experienceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">{bookingData.guests}</span>
              </div>
              <div className="pt-2 mt-2 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${bookingData.totalPrice}</span>
              </div>
            </div>
          </Card>

          {/* User Info */}
          {isAuthenticated && user && (
            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold mb-2">Booking as</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </Card>
          )}

          {/* Stripe Checkout Button */}
          <div className="space-y-4">
            <Button 
              variant="gradient" 
              className="w-full" 
              size="lg"
              onClick={handleStripeCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>Proceed to Payment - ${bookingData.totalPrice}</>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>

          {/* Not logged in prompt */}
          {!isAuthenticated && (
            <Card className="p-4 border-orange-500/30 bg-orange-500/5">
              <p className="text-sm text-center">
                Please{" "}
                <Link to={`/auth?redirect=/vendor/${id}/payment`} className="text-primary underline font-medium">
                  log in
                </Link>{" "}
                to complete your booking
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
