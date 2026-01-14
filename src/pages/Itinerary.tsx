import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface ItineraryItem {
  id: string;
  vendor_name: string;
  vendor_address: string | null;
  place_id: string | null;
  travel_distance: string | null;
  travel_duration: string | null;
  travel_duration_seconds: number | null;
  arrival_tips: string[] | null;
  notes: string | null;
  planned_date: string | null;
  planned_time: string | null;
  created_at: string;
}

const TULUM_CENTRO = { lat: 20.2114, lng: -87.4654 };

export default function Itinerary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching itinerary:', error);
        toast({
          title: "Error",
          description: "Failed to load your itinerary.",
          variant: "destructive",
        });
      } else {
        setItems(data || []);
      }
      setIsLoading(false);
    };

    fetchItinerary();
  }, [navigate, toast]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    const { error } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from itinerary.",
        variant: "destructive",
      });
    } else {
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Removed",
        description: "Item removed from your itinerary.",
      });
    }
    setDeletingId(null);
  };

  const openInGoogleMaps = (item: ItineraryItem) => {
    const query = encodeURIComponent(`${item.vendor_name} Tulum Mexico`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/appview');
    }
  };

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
            <h1 className="text-lg font-bold">My Itinerary</h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
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
              <h2 className="text-xl font-semibold mb-2">No saved items yet</h2>
              <p className="text-muted-foreground mb-6">
                Use the Trip Planner to discover experiences and save them to your itinerary.
              </p>
              <Button onClick={() => navigate('/trip-planner')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Open Trip Planner
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
              
              {items.map(item => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
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

                      {/* Arrival tips preview */}
                      {item.arrival_tips && item.arrival_tips.length > 0 && (
                        <p className="text-xs text-muted-foreground/80 italic">
                          {item.arrival_tips[0]}
                        </p>
                      )}

                      {/* Saved date */}
                      <p className="text-xs text-muted-foreground/60">
                        Saved {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openInGoogleMaps(item)}
                        className="h-8 w-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
