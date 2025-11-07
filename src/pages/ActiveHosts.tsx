import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import VendorBottomNav from "@/components/VendorBottomNav";
import { activeHosts } from "@/data/mockData";

const ActiveHosts = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        <Link 
          to="/vendor/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Active Hosts</h1>
          <p className="text-sm text-muted-foreground">Your partner hosts</p>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
          {activeHosts.map((host) => (
            <Card
              key={host.id}
              className="p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-r from-orange-500 to-pink-500 flex-shrink-0">
                    <AvatarFallback className="text-white font-semibold">
                      {host.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{host.name}</h3>
                    <p className="text-xs text-muted-foreground">{host.propertyName}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pl-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${host.email}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      {host.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${host.phone}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      {host.phone}
                    </a>
                  </div>
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

export default ActiveHosts;
