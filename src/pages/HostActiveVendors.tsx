import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HostBottomNav from "@/components/HostBottomNav";
import { vendors } from "@/data/mockData";

const HostActiveVendors = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/host/dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold">Active Vendors</h1>
            <p className="text-sm text-muted-foreground">Your partner vendors</p>
          </div>
        </div>

        {/* Vendors List */}
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="p-4 hover:shadow-xl transition-all duration-200">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{vendor.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{vendor.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{vendor.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="text-sm font-bold text-primary">{vendor.commission}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default HostActiveVendors;
