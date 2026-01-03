import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ChevronLeft, Star, Clock, Users, DollarSign, 
  Instagram, ExternalLink, Check, Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
}

const VendorPublicProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      checkFavorite();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('vendorFavorites') || '[]');
    setIsFavorite(favorites.includes(id));
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('vendorFavorites') || '[]');
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter((f: string) => f !== id);
      toast.success('Removed from favorites');
    } else {
      newFavorites = [...favorites, id];
      toast.success('Added to favorites');
    }
    localStorage.setItem('vendorFavorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="aspect-square w-full" />
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
          <p className="text-muted-foreground">Profile not found or not published</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const photos = profile.photos || [];

  return (
    <div className="min-h-screen bg-background pb-24">
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

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFavorite}
          className="absolute top-6 right-6 z-10 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
        
        {photos.length > 0 ? (
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <img
              src={photos[currentImageIndex]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-24" />
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
          <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
            <span className="text-white/60 text-lg">No photos available</span>
          </div>
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

        {/* Book Button */}
        <Button className="w-full" size="lg">
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default VendorPublicProfile;