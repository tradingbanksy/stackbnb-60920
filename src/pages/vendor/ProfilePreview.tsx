import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ArrowLeft, Star, Clock, Users, CheckCircle, Heart,
  Instagram, ExternalLink, Store, Eye, Edit, Globe, Plus, Trash2, Loader2, ImagePlus, GripVertical
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import VendorBottomNav from '@/components/VendorBottomNav';
import InteractiveSelector from '@/components/ui/interactive-selector';
import { FaUtensils, FaSpa, FaCamera, FaWineGlass, FaShip, FaBicycle, FaSwimmer, FaMountain } from 'react-icons/fa';
import { Reorder } from 'framer-motion';

interface PriceTier {
  name: string;
  price: number;
}

interface VendorProfile {
  id: string;
  name: string;
  category: string;
  description: string | null;
  about_experience: string | null;
  instagram_url: string | null;
  photos: string[] | null;
  menu_url: string | null;
  price_per_person: number | null;
  price_tiers: PriceTier[] | null;
  duration: string | null;
  max_guests: number | null;
  included_items: string[] | null;
  google_rating: number | null;
  google_reviews_url: string | null;
  is_published: boolean | null;
  listing_type: string | null;
  commission_percentage: number | null;
}

// Category to icon mapping
const categoryIcons: Record<string, { icon: string; faIcon: React.ReactNode }> = {
  'Private Chef': { icon: '👨‍🍳', faIcon: <FaUtensils size={20} className="text-white" /> },
  'Massage & Spa': { icon: '💆', faIcon: <FaSpa size={20} className="text-white" /> },
  'Yacht Charter': { icon: '🛥️', faIcon: <FaShip size={20} className="text-white" /> },
  'Photography': { icon: '📸', faIcon: <FaCamera size={20} className="text-white" /> },
  'Tour Guide': { icon: '🗺️', faIcon: <FaMountain size={20} className="text-white" /> },
  'Fitness & Yoga': { icon: '🧘', faIcon: <FaSpa size={20} className="text-white" /> },
  'Wine Tasting': { icon: '🍷', faIcon: <FaWineGlass size={20} className="text-white" /> },
  'Fishing Charter': { icon: '🎣', faIcon: <FaShip size={20} className="text-white" /> },
  'Water Sports': { icon: '🌊', faIcon: <FaSwimmer size={20} className="text-white" /> },
  'Cooking Class': { icon: '👩‍🍳', faIcon: <FaUtensils size={20} className="text-white" /> },
  'Transportation': { icon: '🚗', faIcon: <FaBicycle size={20} className="text-white" /> },
  'default': { icon: '✨', faIcon: <FaSpa size={20} className="text-white" /> },
};

const VendorProfilePreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [id, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('vendor_profiles')
        .select('*');
      
      if (id) {
        query = query.eq('id', id);
      } else {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();

      if (error) throw error;
      
      if (data) {
        // Parse price_tiers from JSON safely
        let priceTiers: PriceTier[] = [];
        if (Array.isArray(data.price_tiers)) {
          priceTiers = data.price_tiers.map((tier: unknown) => {
            const t = tier as { name?: string; price?: number };
            return {
              name: t.name || '',
              price: t.price || 0,
            };
          });
        }
        
        setProfile({
          ...data,
          price_tiers: priceTiers,
        } as VendorProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!profile) return;
    
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ is_published: !profile.is_published })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
      toast.success(profile.is_published ? 'Profile unpublished' : 'Profile published successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user || !profile) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vendor-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('vendor-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const currentPhotos = profile.photos || [];
      const newPhotos = [...currentPhotos, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from('vendor_profiles')
        .update({ photos: newPhotos })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, photos: newPhotos } : null);
      toast.success(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    if (!profile) return;

    try {
      const urlParts = photoUrl.split('/vendor-photos/');
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('vendor-photos').remove([filePath]);
      }

      const newPhotos = profile.photos?.filter((_, i) => i !== index) || [];
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ photos: newPhotos })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, photos: newPhotos } : null);
      toast.success('Photo deleted');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-[375px] mx-auto">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[280px] w-full mt-4" />
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No profile found</p>
          <Button onClick={() => navigate('/vendor/create-profile')}>
            Create Profile
          </Button>
        </div>
        <VendorBottomNav />
      </div>
    );
  }

  const photos = (profile.photos || []).slice(0, 3);
  const categoryConfig = categoryIcons[profile.category] || categoryIcons['default'];
  
  const photoTitles = photos.map((_, idx) => 
    idx === 0 ? 'Featured' : idx === 1 ? 'In Action' : `View ${idx + 1}`
  );
  const photoIcons = photos.map(() => categoryConfig.faIcon);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />

      <div className="max-w-[375px] mx-auto">
        {/* Preview Banner */}
        <div className="sticky top-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Preview - How Guests See You</span>
          </div>
          <Badge variant={profile.is_published ? "default" : "secondary"} className="text-xs">
            {profile.is_published ? 'Live' : 'Draft'}
          </Badge>
        </div>

        {/* Header */}
        <header className="sticky top-[40px] z-40 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/vendor/dashboard')}
                className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="font-semibold">{profile.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-9 w-9"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
              <Heart className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Interactive Photo Selector */}
        <div className="mb-4 relative group">
          {photos.length > 0 ? (
            <>
              <InteractiveSelector 
                photos={photos}
                titles={photoTitles}
                icons={photoIcons}
              />
              {/* Photo management overlay on hover */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            </>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-4 bg-background">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full max-w-[450px] h-[280px] mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex flex-col items-center justify-center gap-2 hover:from-orange-600 hover:to-purple-700 transition-colors cursor-pointer"
                style={{ minWidth: '300px' }}
              >
                {isUploading ? (
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-12 w-12 text-white/80" />
                    <span className="text-white font-medium">Add Photos</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Experience Header */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{categoryConfig.icon}</span>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {profile.google_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{profile.google_rating}</span>
                  <span className="text-muted-foreground">(Google Reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Tiers Display */}
          {profile.price_tiers && profile.price_tiers.length > 0 ? (
            <Card className="p-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">Pricing Options</p>
                <div className="space-y-2">
                  {profile.price_tiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{tier.name}</span>
                      <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                        ${tier.price}/person
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-xs font-medium">{profile.duration || 'Varies'}</p>
                </div>
                <div className="space-y-1">
                  <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-xs font-medium">Max {profile.max_guests || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  {profile.price_per_person && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                      ${profile.price_per_person}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">per person</p>
                </div>
              </div>
            </Card>
          )}

          {/* Affiliate Commission - Vendor Only */}
          <Card className="p-4 border-amber-500/50 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  💰 Affiliate Commission
                </p>
                <p className="text-xs text-muted-foreground">
                  Visible to hosts & vendors only
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {profile.commission_percentage ? `${profile.commission_percentage}%` : 'Not set'}
                </p>
              </div>
            </div>
          </Card>

          {/* Description */}
          {profile.about_experience && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">About This Experience</h2>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {profile.about_experience}
                </p>
              </Card>
            </div>
          )}

          {/* What's Included */}
          {profile.included_items && profile.included_items.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">What's Included</h2>
              <Card className="p-4">
                <ul className="space-y-2">
                  {profile.included_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Links */}
          {(profile.instagram_url || profile.menu_url || profile.google_reviews_url) && (
            <div className="flex flex-wrap gap-2">
              {profile.instagram_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(profile.instagram_url!, '_blank')}
                  className="gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
              )}
              {profile.menu_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(profile.menu_url!, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Menu
                </Button>
              )}
              {profile.google_reviews_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(profile.google_reviews_url!, '_blank')}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  Google Reviews
                </Button>
              )}
            </div>
          )}

          {/* Photo Gallery Management */}
          {(profile.photos?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Manage Photos</h2>
                <span className="text-xs text-muted-foreground">Drag to reorder</span>
              </div>
              <Card className="p-4">
                <Reorder.Group
                  axis="x"
                  values={profile.photos || []}
                  onReorder={async (newOrder) => {
                    // Update local state immediately
                    setProfile(prev => prev ? { ...prev, photos: newOrder } : null);
                    
                    // Persist to database
                    try {
                      const { error } = await supabase
                        .from('vendor_profiles')
                        .update({ photos: newOrder })
                        .eq('id', profile.id);
                      
                      if (error) throw error;
                    } catch (error) {
                      console.error('Error reordering photos:', error);
                      toast.error('Failed to save photo order');
                    }
                  }}
                  className="grid grid-cols-3 gap-2"
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {profile.photos?.map((photo, idx) => (
                    <Reorder.Item
                      key={photo}
                      value={photo}
                      className="aspect-square rounded-lg overflow-hidden relative group/photo cursor-grab active:cursor-grabbing"
                      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                    >
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                      <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors" />
                      <div className="absolute top-1 left-1 p-1 bg-black/50 rounded opacity-0 group-hover/photo:opacity-100 transition-opacity">
                        <GripVertical className="h-3 w-3 text-white" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo, idx);
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-red-500/90 rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-1 left-1">
                          <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 bg-black/60 text-white">
                            Main
                          </Badge>
                        </div>
                      )}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {/* Add photo button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors mt-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Add</span>
                    </>
                  )}
                </button>
              </Card>
            </div>
          )}
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t p-4 shadow-lg z-30">
          <div className="max-w-[375px] mx-auto flex items-center gap-3">
            <Button 
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => navigate('/vendor/create-profile')}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button 
              className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              <Globe className="h-4 w-4" />
              {isPublishing ? 'Updating...' : profile.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <VendorBottomNav />
    </div>
  );
};

export default VendorProfilePreview;