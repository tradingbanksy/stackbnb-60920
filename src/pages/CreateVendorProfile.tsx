import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Loader2, Instagram, Upload, Sparkles, Check, X, Plus, 
  DollarSign, Clock, Users, ChevronLeft, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

const vendorProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  listingType: z.enum(['restaurant', 'experience'], { required_error: 'Please select a listing type' }),
  category: z.string().min(1, 'Please select a category'),
  instagramUrl: z.string().optional(),
  pricePerPerson: z.coerce.number().min(1, 'Price must be at least $1'),
  duration: z.string().min(1, 'Please enter duration'),
  maxGuests: z.coerce.number().min(1, 'Must accommodate at least 1 guest'),
  description: z.string().optional(),
  aboutExperience: z.string().optional(),
  googlePlaceId: z.string().optional(),
  googleRating: z.coerce.number().optional(),
  googleReviewsUrl: z.string().optional(),
  commissionPercentage: z.coerce.number().min(0, 'Must be at least 0%').max(100, 'Cannot exceed 100%').optional(),
});

type VendorProfileFormData = z.infer<typeof vendorProfileSchema>;

const CATEGORIES = [
  'Private Chef',
  'Massage & Spa',
  'Yacht Charter',
  'Photography',
  'Tour Guide',
  'Fitness & Yoga',
  'Wine Tasting',
  'Fishing Charter',
  'Water Sports',
  'Cooking Class',
  'Art Class',
  'Music & Entertainment',
  'Transportation',
  'Childcare',
  'Pet Care',
  'Cleaning Service',
  'Concierge',
  'Other',
];

interface ExistingProfile {
  id: string;
  name: string;
  category: string;
  listing_type: string;
  description: string | null;
  about_experience: string | null;
  instagram_url: string | null;
  photos: string[] | null;
  menu_url: string | null;
  price_per_person: number | null;
  duration: string | null;
  max_guests: number | null;
  included_items: string[] | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_reviews_url: string | null;
  commission_percentage: number | null;
}

const CreateVendorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Existing profile state
  const [existingProfile, setExistingProfile] = useState<ExistingProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Instagram scraping state
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedPhotos, setScrapedPhotos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  
  // Menu upload state
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [isUploadingMenu, setIsUploadingMenu] = useState(false);
  const [menuUrl, setMenuUrl] = useState<string | null>(null);
  
  // Included items state
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  
  // AI generation state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<VendorProfileFormData>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      pricePerPerson: 0,
      maxGuests: 10,
    }
  });

  const watchedValues = watch();

  // Check for existing profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setExistingProfile(data);
          // Pre-populate form with existing data
          reset({
            name: data.name,
            listingType: data.listing_type as 'restaurant' | 'experience',
            category: data.category,
            description: data.description || '',
            aboutExperience: data.about_experience || '',
            instagramUrl: data.instagram_url || '',
            pricePerPerson: data.price_per_person || 0,
            duration: data.duration || '',
            maxGuests: data.max_guests || 10,
            googlePlaceId: data.google_place_id || '',
            googleRating: data.google_rating || undefined,
            googleReviewsUrl: data.google_reviews_url || '',
            commissionPercentage: data.commission_percentage || undefined,
          });
          setSelectedPhotos(data.photos || []);
          setScrapedPhotos(data.photos || []);
          setIncludedItems(data.included_items || []);
          setMenuUrl(data.menu_url || null);
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkExistingProfile();
  }, [user, reset]);

  // Load pre-selected photos from sessionStorage (from Instagram scrape page)
  useEffect(() => {
    const storedPhotos = sessionStorage.getItem('vendorScrapedPhotos');
    const storedInstagramUrl = sessionStorage.getItem('vendorInstagramUrl');
    
    if (storedPhotos) {
      try {
        const photos = JSON.parse(storedPhotos);
        setSelectedPhotos(prev => [...new Set([...prev, ...photos])]);
        setScrapedPhotos(prev => [...new Set([...prev, ...photos])]);
        sessionStorage.removeItem('vendorScrapedPhotos');
      } catch (e) {
        console.error('Error parsing stored photos:', e);
      }
    }
    
    if (storedInstagramUrl) {
      setValue('instagramUrl', storedInstagramUrl);
      sessionStorage.removeItem('vendorInstagramUrl');
    }
  }, [setValue]);

  // Scrape Instagram photos
  const handleScrapeInstagram = async () => {
    const instagramUrl = watchedValues.instagramUrl;
    if (!instagramUrl?.trim()) {
      toast.error('Please enter an Instagram URL');
      return;
    }

    setIsScraping(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-instagram', {
        body: { instagramUrl }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to scrape Instagram');

      const newPhotos = data.data.photos || [];
      setScrapedPhotos(prev => [...new Set([...prev, ...newPhotos])]);
      toast.success(`Found ${newPhotos.length} photos!`);
    } catch (error) {
      console.error('Scrape error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to scrape Instagram');
    } finally {
      setIsScraping(false);
    }
  };

  // Toggle photo selection
  const togglePhotoSelection = (photo: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photo) 
        ? prev.filter(p => p !== photo)
        : prev.length < 6 
          ? [...prev, photo]
          : prev
    );
  };

  // Handle menu file upload
  const handleMenuUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    setMenuFile(file);
    setIsUploadingMenu(true);

    try {
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('vendor-menus')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('vendor-menus')
        .getPublicUrl(data.path);

      setMenuUrl(urlData.publicUrl);
      toast.success('Menu uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload menu');
      setMenuFile(null);
    } finally {
      setIsUploadingMenu(false);
    }
  };

  // Add included item
  const addIncludedItem = () => {
    if (newItem.trim() && !includedItems.includes(newItem.trim())) {
      setIncludedItems(prev => [...prev, newItem.trim()]);
      setNewItem('');
    }
  };

  // Remove included item
  const removeIncludedItem = (item: string) => {
    setIncludedItems(prev => prev.filter(i => i !== item));
  };

  // Generate AI description
  const handleGenerateDescription = async () => {
    if (!watchedValues.name || !watchedValues.category) {
      toast.error('Please enter a name and category first');
      return;
    }

    setIsGeneratingDescription(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-vendor-description', {
        body: {
          name: watchedValues.name,
          category: watchedValues.category,
          pricePerPerson: watchedValues.pricePerPerson,
          duration: watchedValues.duration,
          maxGuests: watchedValues.maxGuests,
          includedItems,
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to generate description');

      setValue('aboutExperience', data.description);
      toast.success('Description generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Submit form
  const onSubmit = async (formData: VendorProfileFormData) => {
    if (!user) {
      toast.error('Please sign in to create a profile');
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        user_id: user.id,
        name: formData.name,
        listing_type: formData.listingType,
        category: formData.category,
        description: formData.description,
        about_experience: formData.aboutExperience,
        instagram_url: formData.instagramUrl,
        photos: selectedPhotos,
        menu_url: menuUrl,
        price_per_person: formData.pricePerPerson,
        duration: formData.duration,
        max_guests: formData.maxGuests,
        included_items: includedItems,
        google_place_id: formData.googlePlaceId,
        google_rating: formData.googleRating || null,
        google_reviews_url: formData.googleReviewsUrl,
        commission_percentage: formData.commissionPercentage || null,
      };

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('vendor_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);

        if (error) throw error;
        toast.success('Vendor profile updated!');
      } else {
        // Create new profile
        const { error } = await supabase
          .from('vendor_profiles')
          .insert({
            ...profileData,
            is_published: false,
          });

        if (error) throw error;
        toast.success('Vendor profile created!');
      }

      navigate('/vendor/preview');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpdateMode = !!existingProfile;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isUpdateMode ? 'Update Vendor Profile' : 'Create Vendor Profile'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about your service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Listing Type Selection */}
            <div className="space-y-2">
              <Label>Where should this appear? *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('listingType', 'restaurant')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    watchedValues.listingType === 'restaurant'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="text-2xl mb-2">🍽️</div>
                  <p className="font-medium">Restaurant</p>
                  <p className="text-xs text-muted-foreground">Appears in "Restaurants Near You"</p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('listingType', 'experience')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    watchedValues.listingType === 'experience'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="text-2xl mb-2">✨</div>
                  <p className="font-medium">Experience</p>
                  <p className="text-xs text-muted-foreground">Appears in "Popular Experiences"</p>
                </button>
              </div>
              {errors.listingType && <p className="text-sm text-destructive">{errors.listingType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Chef Maria's Kitchen"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={watchedValues.category} 
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="Brief tagline or summary..."
                {...register('description')}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instagram Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              Photos from Instagram
            </CardTitle>
            <CardDescription>Scrape high-quality photos from your Instagram profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://instagram.com/yourusername"
                {...register('instagramUrl')}
                className="flex-1"
              />
              <Button type="button" onClick={handleScrapeInstagram} disabled={isScraping}>
                {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scrape'}
              </Button>
            </div>

            {scrapedPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select up to 6 photos ({selectedPhotos.length}/6 selected)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {scrapedPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedPhotos.includes(photo) 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                      onClick={() => togglePhotoSelection(photo)}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {selectedPhotos.includes(photo) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-8 w-8 text-primary-foreground bg-primary rounded-full p-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPhotos.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Selected Photos Preview</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                      <img src={photo} alt={`Selected ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => togglePhotoSelection(photo)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Menu / Service List
            </CardTitle>
            <CardDescription>Upload a PDF or image of your menu or service offerings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleMenuUpload}
                  disabled={isUploadingMenu}
                  className="flex-1"
                />
                {isUploadingMenu && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              
              {menuUrl && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{menuFile?.name || 'Menu uploaded'}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(menuUrl, '_blank')}
                  >
                    View
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Details</CardTitle>
            <CardDescription>Set your pricing and service parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerPerson" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Price per Person *
                </Label>
                <Input
                  id="pricePerPerson"
                  type="number"
                  placeholder="150"
                  {...register('pricePerPerson')}
                />
                {errors.pricePerPerson && <p className="text-sm text-destructive">{errors.pricePerPerson.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGuests" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Max Guests *
                </Label>
                <Input
                  id="maxGuests"
                  type="number"
                  placeholder="10"
                  {...register('maxGuests')}
                />
                {errors.maxGuests && <p className="text-sm text-destructive">{errors.maxGuests.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Duration *
              </Label>
              <Input
                id="duration"
                placeholder="e.g., 3 hours"
                {...register('duration')}
              />
              {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
            </div>

            {/* Included Items */}
            <div className="space-y-2">
              <Label>What's Included</Label>
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add an item..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludedItem())}
                />
                <Button type="button" variant="outline" onClick={addIncludedItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {includedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {includedItems.map((item, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {item}
                      <button type="button" onClick={() => removeIncludedItem(item)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Google Reviews (Optional)</CardTitle>
            <CardDescription>Link to your Google reviews for credibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleRating">Google Star Rating</Label>
              <Input
                id="googleRating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                placeholder="4.8"
                {...register('googleRating')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleReviewsUrl">Google Reviews URL</Label>
              <Input
                id="googleReviewsUrl"
                placeholder="https://g.page/..."
                {...register('googleReviewsUrl')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Affiliate Program
            </CardTitle>
            <CardDescription>
              Set the commission percentage you offer to hosts who refer guests to you. 
              This is only visible to hosts and other vendors, not guests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commissionPercentage" className="flex items-center gap-1">
                Commission Percentage
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commissionPercentage"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="15"
                  {...register('commissionPercentage')}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Example: If you set 15%, hosts earn $15 for every $100 booking they refer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              About This Experience
            </CardTitle>
            <CardDescription>Generate or write a compelling description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateDescription}
              disabled={isGeneratingDescription}
              className="w-full"
            >
              {isGeneratingDescription ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
            
            <Textarea
              placeholder="Describe your experience in detail..."
              {...register('aboutExperience')}
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUpdateMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isUpdateMode ? 'Update Profile' : 'Create Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendorProfile;
