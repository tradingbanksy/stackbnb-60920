import { Card } from "@/components/ui/card";
import { ArrowLeft, Receipt } from "lucide-react";
import HostBottomNav from "@/components/HostBottomNav";
import { useSmartBack } from "@/hooks/use-smart-back";

const PayoutHistory = () => {
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
          <h1 className="text-2xl font-bold">Payout History</h1>
          <p className="text-sm text-muted-foreground">View your earnings history</p>
        </div>

        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <Receipt className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Payouts Yet</h3>
          <p className="text-sm text-muted-foreground">
            Your payout history will appear here once you start earning commissions from vendor bookings.
          </p>
        </Card>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default PayoutHistory;
