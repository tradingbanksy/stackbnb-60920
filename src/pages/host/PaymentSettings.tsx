import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";
import HostBottomNav from "@/components/HostBottomNav";
import { useSmartBack } from "@/hooks/use-smart-back";

const PaymentSettings = () => {
  const goBack = useSmartBack("/host/profile");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        <button 
          onClick={goBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your payment methods</p>
        </div>

        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Payment settings will be available soon. You'll be able to manage your payment methods and preferences here.
          </p>
        </Card>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default PaymentSettings;
