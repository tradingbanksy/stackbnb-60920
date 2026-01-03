import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Instagram, Image } from 'lucide-react';
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
  const [url, setUrl] = useState('https://www.instagram.com/ikprivatechef');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error('Please enter an Instagram URL');
      return;
    }

    setIsLoading(true);
    setResult(null);

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-6 w-6" />
              Instagram Photo Scraper Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter Instagram profile URL..."
                className="flex-1"
              />
              <Button onClick={handleScrape} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  'Scrape Photos'
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              This will use Firecrawl to extract high-quality photos from the Instagram profile.
            </p>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Results ({result.photos.length} photos from {result.totalFound} found)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {result.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No photos could be extracted.</p>
                  {result.screenshot && (
                    <div className="mt-4">
                      <p className="text-sm mb-2">Screenshot of the page:</p>
                      <img 
                        src={`data:image/png;base64,${result.screenshot}`} 
                        alt="Page screenshot"
                        className="max-w-full mx-auto rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {result.metadata && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Page Metadata</h4>
                  {result.metadata.title && (
                    <p className="text-sm"><strong>Title:</strong> {result.metadata.title}</p>
                  )}
                  {result.metadata.description && (
                    <p className="text-sm mt-1"><strong>Description:</strong> {result.metadata.description}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestInstagramScrape;
