import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import stackdLogo from "@/assets/stackd-logo.png";

const HostPropertyInfo = () => {
  const navigate = useNavigate();
  const { propertyData, updatePropertyData, clearSignupData } = useUser();
  const { setUserRole } = useAuthContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    propertyName: propertyData.propertyName || '',
    airbnbUrl: propertyData.airbnbUrl || '',
    address: propertyData.address || '',
    city: propertyData.city || '',
    state: propertyData.state || '',
    zip: propertyData.zip || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyName.trim()) {
      newErrors.propertyName = "Property name is required";
    }

    if (!formData.airbnbUrl.trim()) {
      newErrors.airbnbUrl = "Airbnb URL is required";
    } else if (!/^https?:\/\/.+/.test(formData.airbnbUrl)) {
      newErrors.airbnbUrl = "Please enter a valid URL";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.zip.trim()) {
      newErrors.zip = "Zip code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updatePropertyData(formData);
      
      // Set user role in database
      const { error } = await setUserRole('host');
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      // Clear signup data after successful registration
      clearSignupData();
      
      toast({
        title: "Account created!",
        description: "Welcome to stackd",
      });
      navigate('/host/dashboard');
    } else {
      toast({
        title: "Validation error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link 
          to="/signup/host" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        
        <Card className="w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img src={stackdLogo} alt="stackd logo" className="h-10 w-10 drop-shadow-lg" />
              <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">stackd</h1>
            </Link>
            <h2 className="text-2xl font-semibold">Property Information</h2>
            <p className="text-muted-foreground">
              We'll verify your listing to ensure authenticity
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyName">Property Name *</Label>
            <Input 
              id="propertyName" 
              name="propertyName"
              value={formData.propertyName}
              onChange={handleChange}
              placeholder="Beach House Retreat" 
              className={errors.propertyName ? "border-destructive" : ""}
            />
            {errors.propertyName && (
              <p className="text-xs text-destructive">{errors.propertyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="airbnbUrl">Airbnb Listing URL *</Label>
            <Input 
              id="airbnbUrl" 
              name="airbnbUrl"
              type="url" 
              value={formData.airbnbUrl}
              onChange={handleChange}
              placeholder="https://airbnb.com/rooms/..." 
              className={errors.airbnbUrl ? "border-destructive" : ""}
            />
            {errors.airbnbUrl && (
              <p className="text-xs text-destructive">{errors.airbnbUrl}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input 
              id="address" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Ocean Drive" 
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input 
              id="city" 
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Miami Beach" 
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State/Region *</Label>
              <Input 
                id="state" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="FL" 
                className={errors.state ? "border-destructive" : ""}
              />
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">Zip Code *</Label>
              <Input 
                id="zip" 
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="33139" 
                className={errors.zip ? "border-destructive" : ""}
              />
              {errors.zip && (
                <p className="text-xs text-destructive">{errors.zip}</p>
              )}
            </div>
          </div>

          <Button type="submit" variant="gradient" className="w-full" size="lg">
            Create Account
          </Button>
        </form>
        </Card>
      </div>
    </div>
  );
};

export default HostPropertyInfo;
