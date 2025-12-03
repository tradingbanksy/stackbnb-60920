import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import stackdLogo from "@/assets/stackd-logo.png";

const HostSignup = () => {
  const navigate = useNavigate();
  const { hostSignupData, updateHostSignupData } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: hostSignupData.firstName || '',
    lastName: hostSignupData.lastName || '',
    email: hostSignupData.email || '',
    phone: hostSignupData.phone || '',
    password: hostSignupData.password || '',
    confirmPassword: hostSignupData.confirmPassword || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateHostSignupData(formData);
      toast({
        title: "Progress saved",
        description: "Moving to property information",
      });
      navigate('/signup/host/property');
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
          <h2 className="text-2xl font-semibold">Sign up as Host</h2>
          <p className="text-muted-foreground">
            Start earning commissions from curated local experiences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input 
              id="firstName" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John" 
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input 
              id="lastName" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe" 
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com" 
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
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
              value={formData.password}
              onChange={handleChange}
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
              value={formData.confirmPassword}
              onChange={handleChange}
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
          <Link to="/auth/host" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
        </Card>
      </div>
    </div>
  );
};

export default HostSignup;
