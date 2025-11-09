import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import HostBottomNav from "@/components/HostBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddVendor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorEmail: '',
    category: '',
    commission: '',
    recommendation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in with a Supabase account", {
          description: "Visit /auth/host to create an account"
        });
        navigate('/auth/host');
        return;
      }

      const { error } = await supabase.from('vendors' as any).insert({
        user_id: user.id,
        name: formData.vendorName,
        email: formData.vendorEmail,
        category: formData.category,
        commission: parseFloat(formData.commission),
        description: formData.recommendation,
      });

      if (error) {
        console.error('Vendor insert error:', error);
        throw error;
      }

      toast.success("Vendor added successfully!");
      navigate('/host/vendors');
    } catch (error: any) {
      console.error('Error adding vendor:', error);
      toast.error("Failed to add vendor", {
        description: error.message || "Please try again"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        <Link 
          to="/host/vendors" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Add New Vendor</h1>
          <p className="text-sm text-muted-foreground">Invite a local service provider</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="vendorName" className="text-sm font-medium">Vendor Name</Label>
              <Input
                id="vendorName"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                placeholder="Ocean Adventures"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorEmail" className="text-sm font-medium">Vendor Email</Label>
              <Input
                id="vendorEmail"
                name="vendorEmail"
                type="email"
                value={formData.vendorEmail}
                onChange={handleChange}
                placeholder="contact@oceanadventures.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger id="category" className="rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="water-sports">Water Sports</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="food-dining">Food & Dining</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="tours">Tours & Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission" className="text-sm font-medium">Proposed Commission (%)</Label>
              <Input
                id="commission"
                name="commission"
                type="number"
                min="0"
                max="100"
                value={formData.commission}
                onChange={handleChange}
                placeholder="20"
                required
              />
              <p className="text-xs text-muted-foreground">
                Vendor must accept this rate. Typical range: 15–25%.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendation" className="text-sm font-medium">Why recommend them?</Label>
              <Textarea
                id="recommendation"
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
                placeholder="Tell your guests why you recommend this vendor..."
                rows={4}
                required
                className="rounded-xl resize-none"
              />
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg">
              Send Invitation
            </Button>
          </form>
        </Card>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default AddVendor;
