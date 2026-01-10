import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TestCancellationEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    vendorEmail: "",
    guestEmail: "guest@example.com",
    experienceName: "Sunset Sailing Tour",
    date: new Date().toISOString().split('T')[0],
    time: "14:00",
    guests: 2,
    vendorPayoutAmount: 150,
    currency: "USD",
    reason: "Change of plans - schedule conflict",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendTestVendorEmail = async () => {
    if (!formData.vendorEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a vendor email address to send the test to.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: "vendor_cancellation",
          vendorEmail: formData.vendorEmail,
          guestEmail: formData.guestEmail,
          experienceName: formData.experienceName,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          vendorPayoutAmount: formData.vendorPayoutAmount,
          currency: formData.currency,
          reason: formData.reason,
        },
      });

      if (error) throw error;

      setLastResult({
        success: true,
        message: `Test email sent successfully to ${formData.vendorEmail}`,
      });

      toast({
        title: "Email Sent!",
        description: `Test cancellation email sent to ${formData.vendorEmail}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send email";
      setLastResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendTestGuestEmail = async () => {
    if (!formData.guestEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a guest email address to send the test to.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: "guest_cancellation",
          guestEmail: formData.guestEmail,
          experienceName: formData.experienceName,
          vendorName: "Test Vendor",
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          totalAmount: formData.vendorPayoutAmount * 1.2, // Simulate total with platform fee
          currency: formData.currency,
          reason: formData.reason,
        },
      });

      if (error) throw error;

      setLastResult({
        success: true,
        message: `Test email sent successfully to ${formData.guestEmail}`,
      });

      toast({
        title: "Email Sent!",
        description: `Test cancellation email sent to ${formData.guestEmail}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send email";
      setLastResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[500px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Test Cancellation Emails</h1>
            <p className="text-sm text-muted-foreground">Simulate cancellation notifications</p>
          </div>
        </div>

        {/* Result Banner */}
        {lastResult && (
          <div className={`rounded-lg p-4 flex items-center gap-3 ${
            lastResult.success 
              ? "bg-green-500/10 border border-green-500/20" 
              : "bg-red-500/10 border border-red-500/20"
          }`}>
            {lastResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            )}
            <p className={`text-sm ${lastResult.success ? "text-green-500" : "text-red-500"}`}>
              {lastResult.message}
            </p>
          </div>
        )}

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Email Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure the test email details. Emails will be sent to the addresses you specify.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendorEmail">Vendor Email *</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  placeholder="vendor@example.com"
                  value={formData.vendorEmail}
                  onChange={(e) => handleInputChange("vendorEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="guest@example.com"
                  value={formData.guestEmail}
                  onChange={(e) => handleInputChange("guestEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceName">Experience Name</Label>
              <Input
                id="experienceName"
                placeholder="Sunset Sailing Tour"
                value={formData.experienceName}
                onChange={(e) => handleInputChange("experienceName", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="guests">Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  value={formData.guests}
                  onChange={(e) => handleInputChange("guests", parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorPayoutAmount">Payout Amount</Label>
                <Input
                  id="vendorPayoutAmount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.vendorPayoutAmount}
                  onChange={(e) => handleInputChange("vendorPayoutAmount", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter cancellation reason..."
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={sendTestVendorEmail}
            disabled={isSending || !formData.vendorEmail}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Vendor Cancellation Email
              </>
            )}
          </Button>

          <Button
            onClick={sendTestGuestEmail}
            disabled={isSending || !formData.guestEmail}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Guest Cancellation Email
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">📧 How to test:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your email address in the "Vendor Email" field</li>
            <li>Customize the booking details as needed</li>
            <li>Click "Send Test Vendor Cancellation Email"</li>
            <li>Check your inbox for the cancellation notification</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestCancellationEmail;
