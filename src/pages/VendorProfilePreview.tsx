import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ChevronLeft, Star, Clock, Users, DollarSign, 
  Instagram, ExternalLink, Check, Eye, Edit, Globe, Plus, Trash2, Loader2, ImagePlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import VendorBottomNav from '@/components/VendorBottomNav';

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
  duration: string | null;
  max_guests: number | null;
  included_items: string[] | null;
  google_rating: number | null;
  google_reviews_url: string | null;
  is_published: boolean | null;
}

const VendorProfilePreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      setProfile(data);
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

      // Update the profile with new photos
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
      // Extract the file path from the URL
      const urlParts = photoUrl.split('/vendor-photos/');
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('vendor-photos').remove([filePath]);
      }

      // Update the profile
      const newPhotos = profile.photos?.filter((_, i) => i !== index) || [];
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ photos: newPhotos })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, photos: newPhotos } : null);
      if (currentImageIndex >= newPhotos.length && newPhotos.length > 0) {
        setCurrentImageIndex(newPhotos.length - 1);
      }
      toast.success('Photo deleted');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-72 w-full" />
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

  const photos = profile.photos || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Preview Banner */}
      <div className="sticky top-0 z-20 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Preview Mode</span>
        </div>
        <Badge variant={profile.is_published ? "default" : "secondary"} className="text-xs">
          {profile.is_published ? 'Published' : 'Draft'}
        </Badge>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Hero Image Carousel */}
      <div className="relative px-3 pt-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Upload button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute top-6 right-6 z-10 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>
        
        {photos.length > 0 ? (
          <div className="relative aspect-square rounded-xl overflow-hidden group">
            <img
              src={photos[currentImageIndex]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-24" />
            {/* Delete current photo button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeletePhoto(photos[currentImageIndex], currentImageIndex)}
              className="absolute top-6 right-16 z-10 bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square w-full rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex flex-col items-center justify-center gap-3 hover:from-orange-600 hover:to-purple-700 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-12 w-12 text-white/80" />
                <span className="text-white font-medium">Tap to add photos</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.category}</p>
            </div>
            {profile.google_rating && (
              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{profile.google_rating}</span>
              </div>
            )}
          </div>
          
          {profile.description && (
            <p className="text-muted-foreground">{profile.description}</p>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          {profile.price_per_person && (
            <Card>
              <CardContent className="p-3 text-center">
                <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="font-bold">${profile.price_per_person}</p>
                <p className="text-xs text-muted-foreground">per person</p>
              </CardContent>
            </Card>
          )}
          {profile.duration && (
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="font-bold">{profile.duration}</p>
                <p className="text-xs text-muted-foreground">duration</p>
              </CardContent>
            </Card>
          )}
          {profile.max_guests && (
            <Card>
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="font-bold">{profile.max_guests}</p>
                <p className="text-xs text-muted-foreground">max guests</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* About Experience */}
        {profile.about_experience && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">About This Experience</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.about_experience}
            </p>
          </div>
        )}

        {/* What's Included */}
        {profile.included_items && profile.included_items.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">What's Included</h2>
            <div className="grid grid-cols-2 gap-2">
              {profile.included_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
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

        {/* Photo Gallery */}
        {photos.length > 1 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Gallery</h2>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden relative transition-all ${
                    idx === currentImageIndex ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-90'
                  }`}
                >
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-8" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate('/vendor/create-profile')}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Globe className="h-4 w-4" />
            {isPublishing ? 'Updating...' : profile.is_published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <VendorBottomNav />
    </div>
  );
};

export default VendorProfilePreview;