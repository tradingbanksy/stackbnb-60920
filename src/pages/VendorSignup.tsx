import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import stackdLogo from "@/assets/stackd-logo-new.png";
import { cn } from "@/lib/utils";

const VendorSignup = () => {
  const navigate = useNavigate();
  const { vendorSignupData, updateVendorSignupData } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    businessName: vendorSignupData.businessName || '',
    businessType: vendorSignupData.businessType || '',
    contactName: vendorSignupData.contactName || '',
    email: vendorSignupData.email || '',
    phone: vendorSignupData.phone || '',
  });
  
  // SECURITY: Password fields kept in local state only, never persisted
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateVendorSignupData(formData);
      toast({
        title: "Progress saved",
        description: "Moving to business details",
      });
      navigate('/signup/vendor/business');
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src={stackdLogo} alt="stackd logo" className="h-10 w-10 drop-shadow-lg" />
            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">stackd</h1>
          </Link>
          <h2 className="text-2xl font-semibold">Vendor Sign Up</h2>
          <p className="text-muted-foreground">
            Join our network of local service providers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input 
              id="businessName" 
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Ocean Adventures"
              className={errors.businessName ? "border-destructive" : ""}
            />
            {errors.businessName && (
              <p className="text-xs text-destructive">{errors.businessName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, businessType: value }));
                if (errors.businessType) {
                  setErrors(prev => ({ ...prev, businessType: '' }));
                }
              }}
            >
              <SelectTrigger id="businessType" className={cn("rounded-xl", errors.businessType && "border-destructive")}>
                <SelectValue placeholder="Select business type" />
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
            {errors.businessType && (
              <p className="text-xs text-destructive">{errors.businessType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input 
              id="contactName" 
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="John Smith"
              className={errors.contactName ? "border-destructive" : ""}
            />
            {errors.contactName && (
              <p className="text-xs text-destructive">{errors.contactName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@business.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input 
              id="phone" 
              name="phone"
              type="tel" 
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword"
              type="password" 
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" variant="gradient" className="w-full" size="lg">
            Continue
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="#" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
        </Card>
      </div>
    </div>
  );
};

export default VendorSignup;
