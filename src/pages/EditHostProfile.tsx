import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import HostBottomNav from "@/components/HostBottomNav";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { useSmartBack } from "@/hooks/use-smart-back";

const EditHostProfile = () => {
  const goBack = useSmartBack("/host/profile");
  const { hostSignupData, propertyData, updateHostSignupData, updatePropertyData } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: hostSignupData.firstName || '',
    lastName: hostSignupData.lastName || '',
    email: hostSignupData.email || '',
    phone: hostSignupData.phone || '',
    propertyName: propertyData.propertyName || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateHostSignupData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    });
    
    updatePropertyData({
      ...propertyData,
      propertyName: formData.propertyName,
    });
    
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCancel = () => {
    setFormData({
      firstName: hostSignupData.firstName || '',
      lastName: hostSignupData.lastName || '',
      email: hostSignupData.email || '',
      phone: hostSignupData.phone || '',
      propertyName: propertyData.propertyName || '',
    });
    setIsEditing(false);
  };

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

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update your information" : "View your information"}
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input
                id="propertyName"
                name="propertyName"
                value={formData.propertyName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  size="lg"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1" size="lg">
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>

      <HostBottomNav />
    </div>
  );
};

export default EditHostProfile;
