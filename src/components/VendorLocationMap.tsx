import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Navigation, Lightbulb, ExternalLink, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorLocationMapProps {
  vendorName: string;
  vendorAddress?: string;
  placeId?: string;
}

interface DirectionsData {
  distance: string;
  duration: string;
  durationValue: number;
  origin: string;
  destination: string;
  vendorLocation?: {
    lat: number;
    lng: number;
  };
  arrivalTips: string[];
  error?: string;
}

const TULUM_CENTRO = { lat: 20.2114, lng: -87.4654 };

export function VendorLocationMap({ vendorName, vendorAddress, placeId }: VendorLocationMapProps) {
  const { toast } = useToast();
  const [directionsData, setDirectionsData] = useState<DirectionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [itineraryItemId, setItineraryItemId] = useState<string | null>(null);

  // Check auth state and if already saved
  useEffect(() => {
    const checkAuthAndSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (user && vendorName) {
        // Check if already saved
        const { data } = await supabase
          .from('itinerary_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('vendor_name', vendorName)
          .maybeSingle();

        if (data) {
          setIsSaved(true);
          setItineraryItemId(data.id);
        }
      }
    };

    checkAuthAndSaved();
  }, [vendorName]);

  useEffect(() => {
    const fetchDirections = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('vendor-directions', {
          body: { vendorName, vendorAddress, placeId }
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data?.error && !data?.vendorLocation) {
          setError(data.error);
        } else {
          setDirectionsData(data);
        }
      } catch (err) {
        console.error('Error fetching directions:', err);
        setError('Unable to load location data');
      } finally {
        setIsLoading(false);
      }
    };

    if (vendorName || vendorAddress || placeId) {
      fetchDirections();
    }
  }, [vendorName, vendorAddress, placeId]);

  const openInGoogleMaps = () => {
    if (directionsData?.vendorLocation) {
      const { lat, lng } = directionsData.vendorLocation;
      const url = `https://www.google.com/maps/dir/${TULUM_CENTRO.lat},${TULUM_CENTRO.lng}/${lat},${lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const query = encodeURIComponent(`${vendorName} Tulum Mexico`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveToItinerary = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your itinerary.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved && itineraryItemId) {
        // Remove from itinerary
        const { error: deleteError } = await supabase
          .from('itinerary_items')
          .delete()
          .eq('id', itineraryItemId);

        if (deleteError) throw deleteError;

        setIsSaved(false);
        setItineraryItemId(null);
        toast({
          title: "Removed from itinerary",
          description: `${vendorName} has been removed from your trip plan.`,
        });
      } else {
        // Add to itinerary
        const { data, error: insertError } = await supabase
          .from('itinerary_items')
          .insert({
            user_id: userId,
            vendor_name: vendorName,
            vendor_address: directionsData?.destination || vendorAddress,
            place_id: placeId,
            travel_distance: directionsData?.distance,
            travel_duration: directionsData?.duration,
            travel_duration_seconds: directionsData?.durationValue,
            arrival_tips: directionsData?.arrivalTips,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        setIsSaved(true);
        setItineraryItemId(data.id);
        toast({
          title: "Saved to itinerary!",
          description: `${vendorName} has been added to your trip plan.`,
        });
      }
    } catch (err) {
      console.error('Error saving to itinerary:', err);
      toast({
        title: "Error",
        description: "Failed to update your itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
    );
  }

  if (error && !directionsData?.vendorLocation) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground text-sm">{error}</p>
      </Card>
    );
  }

  // Build Google Maps Static API URL or Embed URL
  const getMapEmbedUrl = () => {
    if (directionsData?.vendorLocation) {
      const { lat, lng } = directionsData.vendorLocation;
      // Using directions mode to show route from Tulum Centro
      return `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&origin=${TULUM_CENTRO.lat},${TULUM_CENTRO.lng}&destination=${lat},${lng}&mode=driving`;
    }
    // Fallback to search
    const query = encodeURIComponent(`${vendorName} Tulum Mexico`);
    return `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=${query}`;
  };

  return (
    <Card className="overflow-hidden border-border/50">
      {/* Map Section */}
      <div className="relative h-48 bg-muted">
        <iframe
          src={getMapEmbedUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing ${vendorName} location`}
        />
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-4">
        {/* Distance & Duration */}
        {directionsData && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="font-medium">{directionsData.distance}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">{directionsData.duration}</span>
              <span className="text-muted-foreground">from Tulum Centro</span>
            </div>
          </div>
        )}

        {/* Destination */}
        {directionsData?.destination && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{directionsData.destination}</span>
          </div>
        )}

        {/* Arrival Tips */}
        {directionsData?.arrivalTips && directionsData.arrivalTips.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span>Arrival Tips</span>
            </div>
            <ul className="space-y-1.5">
              {directionsData.arrivalTips.map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground pl-6">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Maps
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleSaveToItinerary}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-4 w-4 mr-2" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {isSaved ? "Saved" : "Save to Itinerary"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
