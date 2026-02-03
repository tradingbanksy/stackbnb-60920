import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  Eye,
  Loader2,
  Users,
  Image as ImageIcon,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type VerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'changes_requested';

interface VendorProfile {
  id: string;
  name: string;
  category: string;
  description: string | null;
  about_experience: string | null;
  photos: string[] | null;
  price_per_person: number | null;
  duration: string | null;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  submitted_for_review_at: string | null;
  created_at: string;
  user_id: string;
}

const statusConfig: Record<VerificationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: <Clock className="h-3 w-3" /> },
  pending: { label: 'Pending Review', color: 'bg-amber-500', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
  changes_requested: { label: 'Changes Requested', color: 'bg-orange-500', icon: <MessageSquare className="h-3 w-3" /> },
};

const VendorApprovals = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('pending');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'approve' | 'reject' | 'changes' | null; vendor: VendorProfile | null }>({ type: null, vendor: null });
  const [notes, setNotes] = useState('');

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

  // Fetch vendor profiles for review
  const { data: vendors, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendorApprovals', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('vendor_profiles')
        .select('id, name, category, description, about_experience, photos, price_per_person, duration, verification_status, verification_notes, submitted_for_review_at, created_at, user_id')
        .order('submitted_for_review_at', { ascending: false, nullsFirst: false });

      if (filterStatus !== 'all') {
        query = query.eq('verification_status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VendorProfile[];
    },
    enabled: isAdmin,
  });

  // Update verification status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ vendorId, status, notes }: { vendorId: string; status: VerificationStatus; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = {
        verification_status: status,
        verification_notes: notes || null,
      };

      if (status === 'approved') {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user.id;
      }

      const { error } = await supabase
        .from('vendor_profiles')
        .update(updateData)
        .eq('id', vendorId);

      if (error) throw error;

      // Get vendor email for notification
      const { data: profile } = await supabase
        .from('vendor_profiles')
        .select('name, user_id')
        .eq('id', vendorId)
        .single();

      if (profile) {
        // Get user email
        const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
        const vendorEmail = authData?.user?.email;

        if (vendorEmail) {
          // Send notification email
          await supabase.functions.invoke('send-admin-notification', {
            body: {
              type: status === 'approved' ? 'vendor_approved' :
                    status === 'rejected' ? 'vendor_rejected' : 'vendor_changes_requested',
              vendorEmail,
              vendorName: profile.name,
              verificationNotes: notes,
            },
          });
        }
      }

      return { status, vendorId };
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ['vendorApprovals'] });
      setActionDialog({ type: null, vendor: null });
      setNotes('');
      toast.success(
        status === 'approved' ? 'Vendor approved successfully!' :
        status === 'rejected' ? 'Vendor rejected' : 'Changes requested from vendor'
      );
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update vendor status');
    },
  });

  const handleAction = (type: 'approve' | 'reject' | 'changes', vendor: VendorProfile) => {
    setActionDialog({ type, vendor });
    setNotes(vendor.verification_notes || '');
  };

  const confirmAction = () => {
    if (!actionDialog.vendor || !actionDialog.type) return;

    const statusMap: Record<string, VerificationStatus> = {
      approve: 'approved',
      reject: 'rejected',
      changes: 'changes_requested',
    };

    updateStatus.mutate({
      vendorId: actionDialog.vendor.id,
      status: statusMap[actionDialog.type],
      notes: actionDialog.type !== 'approve' ? notes : undefined,
    });
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
              You don't have permission to access vendor approvals. This page is only available to administrators.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Vendor Approvals</h1>
              <p className="text-sm text-white/70">Review and approve vendor profiles</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {vendors?.filter(v => v.verification_status === 'pending').length || 0}
              </p>
              <p className="text-xs text-white/70">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {vendors?.filter(v => v.verification_status === 'approved').length || 0}
              </p>
              <p className="text-xs text-white/70">Approved</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {vendors?.filter(v => v.verification_status === 'rejected').length || 0}
              </p>
              <p className="text-xs text-white/70">Rejected</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filter by status:</Label>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as VerificationStatus | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="changes_requested">Changes Requested</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor List */}
          {isLoadingVendors ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : vendors && vendors.length > 0 ? (
            <div className="space-y-4">
              {vendors.map((vendor) => {
                const status = statusConfig[vendor.verification_status];
                const photoCount = vendor.photos?.length || 0;

                return (
                  <Card key={vendor.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {vendor.photos && vendor.photos[0] ? (
                          <img
                            src={vendor.photos[0]}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold truncate">{vendor.name}</h3>
                            <p className="text-sm text-muted-foreground">{vendor.category}</p>
                          </div>
                          <Badge className={`${status.color} text-white flex items-center gap-1`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </div>

                        {/* Quick stats */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {photoCount} photos
                          </span>
                          {vendor.price_per_person && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${vendor.price_per_person}/person
                            </span>
                          )}
                          {vendor.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {vendor.duration}
                            </span>
                          )}
                        </div>

                        {vendor.submitted_for_review_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {new Date(vendor.submitted_for_review_at).toLocaleDateString()}
                          </p>
                        )}

                        {vendor.verification_notes && vendor.verification_status !== 'approved' && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 italic">
                            Note: {vendor.verification_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVendor(vendor)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>

                      {vendor.verification_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction('approve', vendor)}
                            className="gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('changes', vendor)}
                            className="gap-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Request Changes
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction('reject', vendor)}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </>
                      )}

                      {vendor.verification_status === 'changes_requested' && (
                        <Button
                          size="sm"
                          onClick={() => handleAction('approve', vendor)}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No vendors found</h3>
              <p className="text-sm text-muted-foreground">
                {filterStatus === 'pending'
                  ? 'No vendors are currently waiting for review.'
                  : 'No vendors match the selected filter.'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVendor.name}</DialogTitle>
                <DialogDescription>{selectedVendor.category}</DialogDescription>
              </DialogHeader>

              {/* Photos */}
              {selectedVendor.photos && selectedVendor.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedVendor.photos.slice(0, 6).map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                {selectedVendor.about_experience && (
                  <div>
                    <Label className="text-sm font-medium">About Experience</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedVendor.about_experience}</p>
                  </div>
                )}

                {selectedVendor.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedVendor.description}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  {selectedVendor.price_per_person && (
                    <div>
                      <Label className="text-sm font-medium">Price</Label>
                      <p className="text-sm text-muted-foreground">${selectedVendor.price_per_person}/person</p>
                    </div>
                  )}
                  {selectedVendor.duration && (
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm text-muted-foreground">{selectedVendor.duration}</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" asChild>
                  <Link to={`/vendor/${selectedVendor.id}`} target="_blank">
                    View Full Profile
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog.type} onOpenChange={() => setActionDialog({ type: null, vendor: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' && 'Approve Vendor'}
              {actionDialog.type === 'reject' && 'Reject Vendor'}
              {actionDialog.type === 'changes' && 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approve' && `Approve "${actionDialog.vendor?.name}" to start accepting bookings.`}
              {actionDialog.type === 'reject' && `Reject "${actionDialog.vendor?.name}". They will need to resubmit for review.`}
              {actionDialog.type === 'changes' && `Request changes from "${actionDialog.vendor?.name}" before approval.`}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.type !== 'approve' && (
            <div className="space-y-2">
              <Label htmlFor="notes">Feedback for vendor</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  actionDialog.type === 'reject'
                    ? 'Explain why the profile was rejected...'
                    : 'Explain what changes are needed...'
                }
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, vendor: null })}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updateStatus.isPending || (actionDialog.type !== 'approve' && !notes.trim())}
              className={
                actionDialog.type === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : actionDialog.type === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionDialog.type === 'approve' && 'Approve'}
              {actionDialog.type === 'reject' && 'Reject'}
              {actionDialog.type === 'changes' && 'Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorApprovals;
