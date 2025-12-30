import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookingData, updateGuestData } = useUser();
  const { toast } = useToast();
  
  // Non-sensitive guest contact info (can be stored in context)
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  
  // SECURITY: Payment card data kept in local state only, never persisted
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvv, setCvv] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!guestInfo.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!guestInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!guestInfo.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    }

    if (!expiration.trim()) {
      newErrors.expiration = "Expiration is required";
    }

    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // SECURITY: Only save non-sensitive guest contact info to context
      updateGuestData(guestInfo);
      toast({
        title: "Processing payment...",
        description: "Please wait",
      });
      
      setTimeout(() => {
        navigate(`/booking/${id}/confirmed`, { replace: true });
      }, 1000);
    } else {
      toast({
        title: "Validation error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
    }
  };

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
            to={`/booking/${id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="text-sm text-muted-foreground">Complete your booking securely</p>
          </div>

          {/* Booking Summary */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium">{bookingData.experienceName}</span>
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

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={guestInfo.fullName}
                onChange={handleGuestInfoChange}
                placeholder="John Doe"
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={guestInfo.email}
                onChange={handleGuestInfoChange}
                placeholder="john@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={guestInfo.phone}
                onChange={handleGuestInfoChange}
                placeholder="(555) 123-4567"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number *</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value);
                    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={errors.cardNumber ? "border-destructive" : ""}
                  autoComplete="off"
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.cardNumber && (
                <p className="text-xs text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiration" className="text-sm font-medium">Expiration *</Label>
                <Input
                  id="expiration"
                  name="expiration"
                  value={expiration}
                  onChange={(e) => {
                    setExpiration(e.target.value);
                    if (errors.expiration) setErrors(prev => ({ ...prev, expiration: '' }));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={errors.expiration ? "border-destructive" : ""}
                  autoComplete="off"
                />
                {errors.expiration && (
                  <p className="text-xs text-destructive">{errors.expiration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium">CVV *</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value);
                    if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
                  }}
                  placeholder="123"
                  maxLength={3}
                  className={errors.cvv ? "border-destructive" : ""}
                  autoComplete="off"
                />
                {errors.cvv && (
                  <p className="text-xs text-destructive">{errors.cvv}</p>
                )}
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg">
              Confirm & Pay ${bookingData.totalPrice}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a mock payment. No actual charges will be made.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
