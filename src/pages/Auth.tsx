import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Apple, Building2, Home, Store, Users } from "lucide-react";
import { FaAirbnb } from "react-icons/fa";
import { authSchema, type AuthFormData } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthContext } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-beach.jpg";
import stackdLogo from "@/assets/stackd-logo-new.png";
import { PasswordResetOTPDialog } from "@/components/PasswordResetOTPDialog";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") as "host" | "vendor" | "user" | null;
  const returnTo = searchParams.get("returnTo");
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { isAuthenticated, isLoading, role: userRole, setUserRole } = useAuthContext();

  // All hooks must be called before any conditional returns
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Only redirect authenticated users who have an existing role in the database
  useEffect(() => {
    const handleRedirect = async () => {
      if (!isLoading && isAuthenticated && userRole) {
        // If there's a returnTo parameter, use it
        if (returnTo) {
          navigate(returnTo, { replace: true });
          return;
        }
        
        if (userRole === "host") {
          navigate("/host/vendors", { replace: true });
        } else if (userRole === "vendor") {
          // Check if vendor already has a profile
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: vendorProfile } = await supabase
              .from('vendor_profiles')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (vendorProfile) {
              // Existing vendor with profile - go to dashboard
              navigate("/vendor/dashboard", { replace: true });
            } else {
              // New vendor without profile - go to create profile
              navigate("/vendor/upload-photos", { replace: true });
            }
          }
        } else if (userRole === "user") {
          navigate("/appview", { replace: true });
        }
      }
    };
    
    handleRedirect();
  }, [isAuthenticated, isLoading, userRole, navigate, returnTo]);

  // Handle OAuth callback - save pending role after Google sign-in
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const pendingRole = localStorage.getItem('pending_role') as 'host' | 'vendor' | 'user' | null;
      
      if (isAuthenticated && pendingRole && !userRole) {
        // User just signed in via OAuth and has a pending role to save
        // Use setUserRole which now calls the Edge Function
        const { error: roleError } = await setUserRole(pendingRole);
        
        if (!roleError) {
          localStorage.removeItem('pending_role');
        } else {
          console.error("Error setting user role:", roleError);
        }
      }
    };
    
    handleOAuthCallback();
  }, [isAuthenticated, userRole, setUserRole]);

  const handleRoleSelect = async (selectedRole: "host" | "vendor" | "user") => {
    // If user is already authenticated but has no role, save the role directly
    if (isAuthenticated && !userRole) {
      setLoading(true);
      const { error } = await setUserRole(selectedRole);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save your role. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Role saved!",
        description: "Redirecting to your dashboard...",
      });
      setLoading(false);
      navigate(getRedirectPath(selectedRole));
      return;
    }
    // Otherwise, proceed to sign up form with role
    setSearchParams({ role: selectedRole });
  };

  const getRedirectPath = (selectedRole: string | null, hasVendorProfile: boolean = false) => {
    // Check for returnTo parameter first
    if (returnTo) return returnTo;
    if (selectedRole === "host") return "/host/vendors";
    if (selectedRole === "vendor") return hasVendorProfile ? "/vendor/dashboard" : "/vendor/upload-photos";
    return "/appview";
  };

  // Show role selection if no role is specified and user is signing up
  if (!role && isSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/appview")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => navigate("/appview")}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Go to home"
              >
                <Home className="h-5 w-5 text-foreground" />
              </button>
            </div>
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src={stackdLogo}
                alt="Stackd" 
                className="h-24 w-24 object-contain"
              />
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Choose your role.</h1>
            </div>

            {/* Role Cards */}
            <div className="space-y-4">
              {/* Guest Card */}
              <button
                onClick={() => handleRoleSelect("user")}
                className="w-full rounded-2xl border-2 border-border bg-card p-6 text-center transition-all duration-200 hover:border-blue-400 hover:shadow-lg focus:outline-none focus:border-blue-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Guest</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover local experiences and activities curated by your host.
                    </p>
                  </div>
                </div>
              </button>

              {/* Host Card */}
              <button
                onClick={() => handleRoleSelect("host")}
                className="w-full rounded-2xl border-2 border-border bg-card p-6 text-center transition-all duration-200 hover:border-purple-400 hover:shadow-lg focus:outline-none focus:border-purple-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Host</h3>
                    <p className="text-sm text-muted-foreground">
                      List your property and connect with vendors to offer curated experiences to your guests.
                    </p>
                  </div>
                </div>
              </button>

              {/* Vendor Card */}
              <button
                onClick={() => handleRoleSelect("vendor")}
                className="w-full rounded-2xl border-2 border-border bg-card p-6 text-center transition-all duration-200 hover:border-orange-400 hover:shadow-lg focus:outline-none focus:border-orange-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Vendor</h3>
                    <p className="text-sm text-muted-foreground">
                      Offer your services and experiences to guests through partner hosts.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an account? <span className="text-primary font-medium">Sign in</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAuth = async (data: AuthFormData) => {
    setLoading(true);
    
    // Use AbortController for proper timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      if (isSignUp) {
        const redirectPath = getRedirectPath(role);
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectPath}`,
          },
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          // Handle "User already registered" - offer to sign in instead
          if (error.message.includes("already registered") || error.message.includes("already exists")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Try signing in instead.",
            });
            setIsSignUp(false);
            setLoading(false);
            return;
          }
          setLoading(false);
          throw error;
        }
        
        // Save user role if provided - use Edge Function for secure role assignment
        if (signUpData.user && role) {
          // Call Edge Function to assign role securely server-side
          // Retry up to 3 times with delay
          let roleAssigned = false;
          for (let attempt = 1; attempt <= 3 && !roleAssigned; attempt++) {
            try {
              const { data: roleData, error: roleError } = await supabase.functions.invoke('assign-role', {
                body: { role }
              });
              
              if (roleError) {
                console.error(`Attempt ${attempt}: Error setting user role:`, roleError);
                if (attempt < 3) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
              } else if (roleData?.success) {
                roleAssigned = true;
                console.log('Role assigned successfully:', role);
              }
            } catch (err) {
              console.error(`Attempt ${attempt}: Exception setting role:`, err);
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          }
          
          if (!roleAssigned) {
            toast({
              title: "Warning",
              description: "Account created but role wasn't saved. Please select your role again.",
              variant: "destructive",
            });
          }
        }
        
        toast({
          title: "Success!",
          description: "Account created successfully.",
        });
        setLoading(false);
        navigate(redirectPath);
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password,
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          setLoading(false);
          throw error;
        }
        
        // Fetch user's role and redirect accordingly
        if (signInData.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', signInData.user.id)
            .maybeSingle();
          
          if (roleData?.role) {
            // User has a role, check for vendor profile if vendor
            let hasVendorProfile = false;
            if (roleData.role === 'vendor') {
              const { data: vendorProfile } = await supabase
                .from('vendor_profiles')
                .select('id')
                .eq('user_id', signInData.user.id)
                .maybeSingle();
              hasVendorProfile = !!vendorProfile;
            }
            
            const redirectPath = getRedirectPath(roleData.role, hasVendorProfile);
            toast({
              title: "Welcome back!",
              description: "Successfully signed in.",
            });
            setLoading(false);
            navigate(redirectPath);
          } else {
            // No role found - need to select one
            toast({
              title: "Welcome back!",
              description: "Please select your role to continue.",
            });
            setLoading(false);
            setIsSignUp(true); // Show role selection
            setSearchParams({}); // Clear role param to show selection screen
          }
        }
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      setLoading(false);
      
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Connection Timeout",
          description: "Request took too long. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const rawMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      const errorMessage = rawMessage.includes("Invalid login credentials")
        ? "Invalid email or password. If you recently enabled leaked-password protection, you may need to reset your password."
        : rawMessage;

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Store the selected role in localStorage so we can save it after OAuth redirect
      if (role) {
        localStorage.setItem('pending_role', role);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = form.getValues("email").trim();
    if (!email) {
      toast({
        title: "Enter your email",
        description: "Type your email above, then click Forgot password.",
        variant: "destructive",
      });
      return;
    }
    setResetEmail(email);
    setShowOTPDialog(true);
  };

  return (
    <>
      <PasswordResetOTPDialog 
        open={showOTPDialog} 
        onOpenChange={setShowOTPDialog} 
        email={resetEmail} 
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/appview")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => navigate("/appview")}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Go to home"
          >
            <Home className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Sign up to save your favorite experiences" : "Sign in to access your profile"}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Button>

                {!isSignUp && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </form>
            </Form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  form.clearErrors();
                }}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">Continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() =>
                  toast({
                    title: "Coming Soon",
                    description: "Apple Sign-In will be available soon.",
                  })
                }
              >
                <Apple className="h-5 w-5" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() =>
                  toast({
                    title: "Coming Soon",
                    description: "Airbnb login will be available soon.",
                  })
                }
              >
                <FaAirbnb className="h-5 w-5 text-[#FF5A5F]" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Auth;