import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Waves, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const VendorBusinessDetails = () => {
  const navigate = useNavigate();
  const { businessData, updateBusinessData, completeSignup } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    address: businessData.address || '',
    city: businessData.city || '',
    state: businessData.state || '',
    zip: businessData.zip || '',
    description: businessData.description || '',
    taxId: businessData.taxId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    if (!formData.description.trim()) {
      newErrors.description = "Business description is required";
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = "Tax ID/EIN is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateBusinessData(formData);
      completeSignup('vendor');
      toast({
        title: "Account created!",
        description: "Welcome to stackd",
      });
      navigate('/vendor/dashboard');
    } else {
      toast({
        title: "Validation error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link 
          to="/signup/vendor" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        
        <Card className="w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Waves className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">stackd</h1>
            </Link>
            <h2 className="text-2xl font-semibold">Business Details</h2>
            <p className="text-muted-foreground">
              Complete your business profile
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Business Address *</Label>
            <Input 
              id="address" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="456 Main Street" 
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
              <Label htmlFor="state">State / Region *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Business Description *</Label>
            <Textarea 
              id="description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your business..."
              rows={4}
              className={`rounded-xl resize-none ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN *</Label>
            <Input 
              id="taxId" 
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              placeholder="12-3456789" 
              className={errors.taxId ? "border-destructive" : ""}
            />
            {errors.taxId && (
              <p className="text-xs text-destructive">{errors.taxId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Required for payment processing.
            </p>
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

export default VendorBusinessDetails;
