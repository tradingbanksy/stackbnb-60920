import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HostBottomNav from "@/components/HostBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Vendor = {
  id: string;
  name: string;
  email: string;
  category: string;
  commission: number;
  description: string | null;
};

const HostVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendors' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVendors((data as any) || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors' as any)
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      toast.success("Vendor removed successfully");
      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error("Failed to remove vendor");
    } finally {
      setVendorToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">My Vendors</h1>
              <p className="text-sm text-muted-foreground">Manage your service providers</p>
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
            <Link to="/host/vendors/add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Vendor
            </Link>
          </Button>
        </div>

        {/* Vendors List */}
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No vendors yet. Add your first vendor to get started!</p>
            </Card>
          ) : (
            vendors.map((vendor) => (
              <Card key={vendor.id} className="p-4 hover:shadow-xl transition-all duration-200">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold leading-tight flex-1">{vendor.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs flex-shrink-0">
                        {vendor.commission}%
                      </Badge>
                      <button
                        onClick={() => setVendorToDelete(vendor.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors active:scale-95"
                        aria-label="Delete vendor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{vendor.description}</p>
                  <Badge variant="outline" className="text-xs">{vendor.category}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!vendorToDelete} onOpenChange={() => setVendorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this vendor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => vendorToDelete && handleDeleteVendor(vendorToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HostBottomNav />
    </div>
  );
};

export default HostVendors;
