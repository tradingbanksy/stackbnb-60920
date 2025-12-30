import { Card } from "@/components/ui/card";
import { ArrowLeft, DollarSign } from "lucide-react";
import VendorBottomNav from "@/components/VendorBottomNav";
import { revenueBreakdown } from "@/data/mockData";
import { useSmartBack } from "@/hooks/use-smart-back";

const RevenueBreakdown = () => {
  const goBack = useSmartBack("/vendor/dashboard");
  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0);

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
          <h1 className="text-2xl font-bold">Revenue Breakdown</h1>
          <p className="text-sm text-muted-foreground">Detailed revenue by service</p>
        </div>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <div className="space-y-3 max-h-[calc(100vh-340px)] overflow-y-auto">
          {revenueBreakdown.map((item) => (
            <Card
              key={item.id}
              className="p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{item.service}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.bookings} bookings</p>
                  </div>
                  <p className="text-base font-bold whitespace-nowrap">${item.amount.toLocaleString()}</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.amount / totalRevenue) * 100}%` }}
                  />
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

export default RevenueBreakdown;
