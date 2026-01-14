import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

interface ItineraryItem {
  id: string;
  vendor_name: string;
  vendor_address: string | null;
  travel_distance: string | null;
  travel_duration: string | null;
  arrival_tips: string[] | null;
  sort_order: number;
  created_at: string;
}

interface SharedItinerary {
  id: string;
  title: string;
  user_id: string;
}

export default function SharedItinerary() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [sharedItinerary, setSharedItinerary] = useState<SharedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSharedItinerary = async () => {
      if (!token) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Fetch shared itinerary by token
      const { data: sharedData, error: sharedError } = await supabase
        .from('shared_itineraries')
        .select('*')
        .eq('share_token', token)
        .eq('is_public', true)
        .maybeSingle();

      if (sharedError || !sharedData) {
        console.error('Error fetching shared itinerary:', sharedError);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setSharedItinerary(sharedData);

      // Fetch itinerary items for this user
      const { data: itemsData, error: itemsError } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('user_id', sharedData.user_id)
        .order('sort_order', { ascending: true });

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
      } else {
        setItems(itemsData || []);
      }

      setIsLoading(false);
    };

    fetchSharedItinerary();
  }, [token]);

  const openInGoogleMaps = (vendorName: string) => {
    const query = encodeURIComponent(`${vendorName} Tulum Mexico`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (notFound) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Itinerary not found</h2>
          <p className="text-muted-foreground mb-6 text-center">
            This itinerary may have been removed or the link is invalid.
          </p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">
              {sharedItinerary?.title || 'Shared Itinerary'}
            </h1>
          </div>
          <div className="w-10" />
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No items in this itinerary</h2>
              <p className="text-muted-foreground mb-6">
                The owner hasn't added any items yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'place' : 'places'} to visit in Tulum
                </p>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Order Number */}
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <h3 className="font-semibold">{item.vendor_name}</h3>
                        
                        {/* Travel info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {item.travel_distance && (
                            <div className="flex items-center gap-1.5">
                              <Navigation className="h-3.5 w-3.5" />
                              <span>{item.travel_distance}</span>
                            </div>
                          )}
                          {item.travel_duration && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{item.travel_duration}</span>
                            </div>
                          )}
                        </div>

                        {/* Address */}
                        {item.vendor_address && (
                          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{item.vendor_address}</span>
                          </div>
                        )}

                        {/* Arrival tips */}
                        {item.arrival_tips && item.arrival_tips.length > 0 && (
                          <p className="text-xs text-muted-foreground/80 italic">
                            {item.arrival_tips[0]}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openInGoogleMaps(item.vendor_name)}
                        className="h-8 w-8 shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* CTA for viewer */}
              <div className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Want to plan your own Tulum trip?
                </p>
                <Button onClick={() => navigate('/trip-planner')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Planning
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
