import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import VendorBottomNav from "@/components/VendorBottomNav";
import { useState, useEffect } from "react";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  capacity: string;
}


const VendorServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem('vendorServices');
    return stored ? JSON.parse(stored) : [
      {
        id: "1",
        name: "Sunset Kayak Tour",
        description: "Experience the magic of sunset from the water with our guided kayak adventure.",
        duration: "2 hours",
        price: "$80.00",
        capacity: "Max 6 people"
      },
      {
        id: "2",
        name: "Snorkeling Adventure",
        description: "Discover vibrant marine life in crystal clear waters with all equipment provided.",
        duration: "3 hours",
        price: "$95.00",
        capacity: "Max 8 people"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('vendorServices', JSON.stringify(services));
  }, [services]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">My Services</h1>
              <p className="text-sm text-muted-foreground">Manage your offerings</p>
            </div>
            <button
              onClick={() => navigate('/signout')}
              className="p-2 rounded-lg hover:bg-muted transition-colors active:scale-95"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <Button asChild variant="gradient" className="w-full">
            <Link to="/vendor/services/add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Link>
          </Button>
        </div>

        {/* Services List */}
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {services.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No services yet. Add your first service to get started!</p>
            </Card>
          ) : (
            services.map((service) => (
            <Card key={service.id} className="p-4 hover:shadow-xl transition-all duration-200 hover:scale-[1.01] active:scale-95">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-tight flex-1">{service.name}</h3>
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs flex-shrink-0">
                    {service.price}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{service.description}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{service.duration}</Badge>
                  <Badge variant="outline" className="text-xs">{service.capacity}</Badge>
                </div>
              </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <VendorBottomNav />
    </div>
  );
};

export default VendorServices;
