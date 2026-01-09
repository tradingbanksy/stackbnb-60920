import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, Star, Clock, Users, CheckCircle, Heart,
  Instagram, ExternalLink, Store, MessageSquare, Quote
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import InteractiveSelector from '@/components/ui/interactive-selector';
import PriceComparison from '@/components/PriceComparison';
import { FaUtensils, FaSpa, FaCamera, FaWineGlass, FaShip, FaBicycle, FaSwimmer, FaMountain } from 'react-icons/fa';

interface PriceTier {
  name: string;
  price: number;
}

interface AirbnbReview {
  reviewerName: string;
  date: string;
  comment: string;
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
  commission_percentage: number | null;
  airbnb_experience_url: string | null;
  airbnb_reviews: AirbnbReview[] | null;
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

const VendorPublicProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { role, isAuthenticated } = useAuthContext();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
  
  // Commission is host-only AND only when explicitly in host context.
  // This prevents it from appearing while casually exploring the public vendor page.
  const isHostContext = searchParams.get('mode') === 'host';
  const canSeeCommission = isAuthenticated && role === 'host' && isHostContext;
  
  // Get hostId from URL if guest came from a host's guide
  const hostId = searchParams.get('host');

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
        
        // Parse airbnb_reviews from JSON safely
        let airbnbReviews: AirbnbReview[] = [];
        if (Array.isArray(data.airbnb_reviews)) {
          airbnbReviews = data.airbnb_reviews.map((review: unknown) => {
            const r = review as { reviewerName?: string; date?: string; comment?: string };
            return {
              reviewerName: r.reviewerName || '',
              date: r.date || '',
              comment: r.comment || '',
            };
          });
        }
        
        setProfile({
          ...data,
          price_tiers: priceTiers,
          airbnb_reviews: airbnbReviews,
        } as VendorProfile);
      }
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/appview');
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
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Profile not found or not published</p>
          <Button variant="link" className="mt-4" onClick={handleBack}>
            Back to Explore
          </Button>
        </Card>
      </div>
    );
  }

  const photos = (profile.photos || []).slice(0, 3); // Limit to 3 photos for uniform display
  const categoryConfig = categoryIcons[profile.category] || categoryIcons['default'];
  
  // Generate titles and icons for the selector
  const photoTitles = photos.map((_, idx) => 
    idx === 0 ? 'Featured' : idx === 1 ? 'In Action' : `View ${idx + 1}`
  );
  const photoIcons = photos.map(() => categoryConfig.faIcon);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[375px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="font-semibold">{profile.category}</span>
            </div>
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </header>

        {/* Interactive Photo Selector */}
        <div className="mb-4">
          {photos.length > 0 ? (
            <InteractiveSelector 
              photos={photos}
              titles={photoTitles}
              icons={photoIcons}
            />
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="w-full max-w-[450px] h-[280px] mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                <Store className="h-16 w-16 text-white/60" />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Experience Header */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-medium leading-tight">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.category}</p>
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

          {/* Price Tier Selector */}
          {profile.price_tiers && profile.price_tiers.length > 0 ? (
            <Card className="p-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Service Type</label>
                <Select
                  value={selectedTierIndex.toString()}
                  onValueChange={(val) => setSelectedTierIndex(parseInt(val))}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {profile.price_tiers.map((tier, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {tier.name} - ${tier.price}/person
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Your quote:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    ${profile.price_tiers[selectedTierIndex]?.price || 0}/person
                  </span>
                </div>
              </div>
            </Card>
          ) : profile.price_per_person ? (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price per person:</span>
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg px-3 py-1">
                  ${profile.price_per_person}
                </Badge>
              </div>
            </Card>
          ) : null}

          {/* Price Comparison */}
          {(profile.price_per_person || (profile.price_tiers && profile.price_tiers.length > 0)) && (
            <PriceComparison
              category={profile.category}
              experienceName={profile.name}
              currentPrice={
                profile.price_tiers && profile.price_tiers.length > 0
                  ? profile.price_tiers[selectedTierIndex]?.price || 0
                  : profile.price_per_person || 0
              }
              duration={profile.duration || undefined}
            />
          )}

          {/* Quick Info */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">{profile.duration || 'Varies'}</p>
                <p className="text-xs text-muted-foreground">duration</p>
              </div>
              <div className="space-y-1">
                <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">Up to {profile.max_guests || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">guests</p>
              </div>
            </div>
          </Card>

          {/* Affiliate Commission - Hosts & Vendors Only */}
          {canSeeCommission && profile.commission_percentage && (
            <Card className="p-4 border-amber-500/50 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    💰 Affiliate Commission
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Partner with this vendor
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {profile.commission_percentage}%
                  </p>
                </div>
              </div>
            </Card>
          )}

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

          {/* Guest Reviews */}
          {profile.airbnb_reviews && profile.airbnb_reviews.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Guest Reviews
              </h2>
              <div className="space-y-3">
                {profile.airbnb_reviews.map((review, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{review.reviewerName}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex gap-2">
                        <Quote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        <p className="text-sm text-muted-foreground italic">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {profile.airbnb_experience_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(profile.airbnb_experience_url!, '_blank')}
                  className="gap-2 w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  View All Reviews on Airbnb
                </Button>
              )}
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
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-lg z-40">
          <div className="max-w-[375px] mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {profile.price_tiers && profile.price_tiers.length > 0 
                  ? profile.price_tiers[selectedTierIndex]?.name 
                  : 'Price'}
              </p>
              <p className="text-2xl font-bold">
                ${profile.price_tiers && profile.price_tiers.length > 0 
                  ? profile.price_tiers[selectedTierIndex]?.price 
                  : profile.price_per_person || 'TBD'}
              </p>
            </div>
            <Button 
              variant="default"
              size="lg"
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              onClick={() => {
                const params = new URLSearchParams();
                if (profile.price_tiers && profile.price_tiers.length > 0) {
                  params.set('tier', selectedTierIndex.toString());
                }
                // Pass hostId through to booking form if present
                if (hostId) {
                  params.set('host', hostId);
                }
                navigate(`/vendor/${id}/book${params.toString() ? `?${params.toString()}` : ''}`);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPublicProfile;