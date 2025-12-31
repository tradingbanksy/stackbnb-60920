import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Apple } from "lucide-react";
import { FaAirbnb } from "react-icons/fa";
import { authSchema, type AuthFormData } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthContext } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") as "host" | "vendor" | null;
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, role: userRole, setUserRole } = useAuthContext();

  // Only redirect authenticated users who have an existing role in the database
  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole) {
      if (userRole === "host") {
        navigate("/host/dashboard", { replace: true });
      } else if (userRole === "vendor") {
        navigate("/vendor/dashboard", { replace: true });
      }
      // Don't redirect if no role - let them complete signup flow
    }
  }, [isAuthenticated, isLoading, userRole, navigate]);

  const getRedirectPath = (selectedRole: string | null) => {
    if (selectedRole === "host") return "/host/dashboard";
    if (selectedRole === "vendor") return "/vendor/dashboard";
    return "/appview";
  };

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAuth = async (data: AuthFormData) => {
    setLoading(true);

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
        if (error) throw error;
        
        // Save user role if provided
        if (signUpData.user && role) {
          const { error: roleError } = await setUserRole(role);
          if (roleError) {
            console.error("Error setting user role:", roleError);
          }
        }
        
        toast({
          title: "Success!",
          description: "Account created successfully.",
        });
        navigate(redirectPath);
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password,
        });
        if (error) throw error;
        
        // Fetch user's role and redirect accordingly
        let redirectPath = "/appview";
        if (signInData.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', signInData.user.id)
            .maybeSingle();
          
          redirectPath = getRedirectPath(roleData?.role ?? null);
        }
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        navigate(redirectPath);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const redirectPath = getRedirectPath(role);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/appview"))}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
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
  );
};

export default Auth;