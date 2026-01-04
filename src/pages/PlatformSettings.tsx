import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, Percent, Save, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PlatformSettings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [platformFee, setPlatformFee] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      return !!data;
    },
  });

  // Fetch current platform settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (newFee: number) => {
      const { error } = await supabase
        .from('platform_settings')
        .update({ platform_fee_percentage: newFee })
        .eq('id', settings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('Platform settings updated successfully');
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Make sure you have admin privileges.');
    },
  });

  // Set initial value when settings load
  useEffect(() => {
    if (settings?.platform_fee_percentage !== undefined) {
      setPlatformFee(settings.platform_fee_percentage.toString());
    }
  }, [settings]);

  const handleFeeChange = (value: string) => {
    setPlatformFee(value);
    const numValue = parseFloat(value);
    setHasChanges(
      !isNaN(numValue) && 
      numValue !== settings?.platform_fee_percentage
    );
  };

  const handleSave = () => {
    const numValue = parseFloat(platformFee);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      toast.error('Please enter a valid percentage between 0 and 100');
      return;
    }
    updateSettings.mutate(numValue);
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access platform settings. This page is only available to administrators.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-600 px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Platform Settings</h1>
              <p className="text-sm text-white/70">Configure commission rates</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Platform Fee Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <Percent className="h-6 w-6 text-violet-500" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Platform Fee</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The percentage taken from each booking as platform revenue
                </p>
              </div>
            </div>

            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee Percentage</Label>
                  <div className="relative">
                    <Input
                      id="platformFee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={platformFee}
                      onChange={(e) => handleFeeChange(e.target.value)}
                      className="pr-8"
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: {settings?.platform_fee_percentage}% • Enter a value between 0-100
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || updateSettings.isPending}
                  className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {updateSettings.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-4 bg-muted/50 border-dashed">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How it works</p>
                <p>
                  When a guest makes a booking, the payment is split automatically:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Platform receives <strong>{platformFee || settings?.platform_fee_percentage || 10}%</strong></li>
                  <li>Host receives their configured commission (per vendor)</li>
                  <li>Vendor receives the remainder</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
