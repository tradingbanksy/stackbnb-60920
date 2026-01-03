import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Instagram, Image, Check, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScrapeResult {
  url: string;
  photos: string[];
  totalFound: number;
  screenshot?: string;
  metadata?: {
    title?: string;
    description?: string;
  };
}

const TestInstagramScrape = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error('Please enter an Instagram URL');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setSelectedPhotos([]);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-instagram', {
        body: { instagramUrl: url }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape Instagram');
      }

      setResult(data.data);
      toast.success(`Found ${data.data.photos.length} high-quality photos!`);
    } catch (error) {
      console.error('Scrape error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to scrape Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhotoSelection = (photo: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photo) 
        ? prev.filter(p => p !== photo)
        : prev.length < 6 
          ? [...prev, photo]
          : prev
    );
  };

  const handleContinue = () => {
    // Store selected photos and Instagram URL in sessionStorage for the profile form
    sessionStorage.setItem('vendorScrapedPhotos', JSON.stringify(selectedPhotos));
    sessionStorage.setItem('vendorInstagramUrl', url);
    navigate('/vendor/create-profile');
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <Instagram className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Add Your Photos</h1>
          <p className="text-muted-foreground">
            Enter your Instagram profile URL to import your best photos
          </p>
        </div>

        {/* Scrape Form */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/yourusername"
                className="flex-1"
              />
              <Button onClick={handleScrape} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  'Get Photos'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && result.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Select Your Photos
              </CardTitle>
              <CardDescription>
                Choose up to 6 photos for your profile ({selectedPhotos.length}/6 selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {result.photos.map((photo, index) => (
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
                        target.parentElement!.style.display = 'none';
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
            </CardContent>
          </Card>
        )}

        {result && result.photos.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No photos could be extracted. Try a different profile URL.</p>
            </CardContent>
          </Card>
        )}

        {/* Selected Preview & Continue */}
        {selectedPhotos.length > 0 && (
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">Selected Photos</p>
                <Button onClick={handleContinue} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedPhotos.map((photo, index) => (
                  <div key={index} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                    <img src={photo} alt={`Selected ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo);
                      }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip option */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/vendor/create-profile')}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestInstagramScrape;
