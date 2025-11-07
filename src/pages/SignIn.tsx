import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Waves, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const { completeSignup, isLoggedIn, userRole } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '' as 'host' | 'vendor' | '',
  });

  // Redirect if already logged in
  if (isLoggedIn && userRole) {
    if (userRole === 'host') {
      navigate('/host/dashboard', { replace: true });
    } else if (userRole === 'vendor') {
      navigate('/vendor/dashboard', { replace: true });
    }
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.role) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Simulate login
    completeSignup(formData.role);
    
    toast({
      title: "Welcome back!",
      description: "You've successfully signed in",
    });

    // Redirect based on role
    setTimeout(() => {
      if (formData.role === 'host') {
        navigate('/host/dashboard');
      } else {
        navigate('/vendor/dashboard');
      }
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Waves className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              stackd
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Sign in as</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'host' | 'vendor') => setFormData(prev => ({ ...prev, role: value }))}
              required
            >
              <SelectTrigger id="role" className="rounded-xl">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="host">Host</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="gradient" className="w-full" size="lg">
            Sign In
          </Button>

          <div className="text-center">
            <Link to="#" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Don't have an account?</p>
          <div className="flex gap-2 justify-center">
            <Link to="/signup/host" className="text-primary hover:underline">
              Sign up as Host
            </Link>
            <span>•</span>
            <Link to="/signup/vendor" className="text-primary hover:underline">
              Sign up as Vendor
            </Link>
          </div>
        </div>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
