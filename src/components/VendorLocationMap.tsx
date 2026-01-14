import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Navigation, Lightbulb, ExternalLink, Bookmark, BookmarkCheck, Loader2, Car, Map, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [mapError, setMapError] = useState(false);

  // Check auth state and if already saved
  useEffect(() => {
    const checkAuthAndSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (user && vendorName) {
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
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>
    );
  }

  if (error && !directionsData?.vendorLocation) {
    return (
      <Card className="p-4 border-border/50 bg-card/80 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">{error}</p>
      </Card>
    );
  }

  // Generate static map URL using OpenStreetMap tiles (no API key needed)
  const getStaticMapUrl = () => {
    if (!directionsData?.vendorLocation) return null;
    const { lat, lng } = directionsData.vendorLocation;
    // Use a free static map service
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=600x200&maptype=osmarenderer&markers=${lat},${lng},red-pushpin`;
  };

  const staticMapUrl = getStaticMapUrl();

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
      {/* Mini Map Preview */}
      {staticMapUrl && !mapError ? (
        <div 
          className="relative h-32 w-full cursor-pointer group overflow-hidden bg-muted"
          onClick={openInGoogleMaps}
        >
          <img
            src={staticMapUrl}
            alt={`Map showing ${vendorName} location`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setMapError(true)}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
          {/* Tap to open indicator */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-3 w-3" />
            Open in Maps
          </div>
        </div>
      ) : directionsData?.vendorLocation ? (
        /* Route visualization: Tulum Centro → Destination */
        <div 
          className="relative h-40 w-full cursor-pointer group overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-teal-950/30"
          onClick={openInGoogleMaps}
        >
          {/* Subtle map grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>
          
          {/* Curved route path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
            {/* Animated dashed route line */}
            <path 
              d="M 80 80 Q 200 40 320 80" 
              fill="none" 
              stroke="url(#routeGradient)" 
              strokeWidth="3" 
              strokeDasharray="8 6"
              strokeLinecap="round"
              className="animate-pulse"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Origin: Tulum Centro */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-muted border-2 border-primary/40 flex items-center justify-center shadow-md">
                <CircleDot className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
              Tulum Centro
            </span>
          </div>

          {/* Destination: Vendor */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/20 animate-ping absolute inset-0" />
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg relative border-2 border-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-foreground bg-background/90 px-1.5 py-0.5 rounded shadow-sm max-w-[80px] truncate">
              {vendorName.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>

          {/* Distance badge in center */}
          {directionsData && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm shadow-sm border border-border/50">
              <Car className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{directionsData.distance}</span>
              <span className="text-muted-foreground">•</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{directionsData.duration}</span>
            </div>
          )}

          {/* Tap to open indicator */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-3 w-3" />
            Open in Maps
          </div>
        </div>
      ) : null}
      
      {/* Compact Location Header */}
      <div className="p-4 space-y-4">
        {/* Main Info Row */}
        <div className="flex items-start gap-3">
          {/* Map Pin Icon with gradient background */}
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            {/* Animated pulse ring */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-20" />
          </div>
          
          {/* Location Details */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {vendorName}
            </h4>
            {directionsData?.destination && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {directionsData.destination}
              </p>
            )}
            
            {/* Distance & Duration Pills */}
            {directionsData && (
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Car className="h-3 w-3" />
                  <span>{directionsData.distance}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  <span>{directionsData.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Arrival Tips - Collapsible style */}
        {directionsData?.arrivalTips && directionsData.arrivalTips.length > 0 && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pro Tips</span>
                <ul className="space-y-1">
                  {directionsData.arrivalTips.slice(0, 2).map((tip, index) => (
                    <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={openInGoogleMaps}
            className={cn(
              "flex-1 h-11 rounded-xl font-medium",
              "bg-gradient-to-r from-primary to-primary/80",
              "hover:from-primary/90 hover:to-primary/70",
              "shadow-lg shadow-primary/25",
              "transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            )}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            onClick={handleSaveToItinerary}
            disabled={isSaving}
            className={cn(
              "h-11 px-4 rounded-xl transition-all duration-300",
              isSaved && "bg-green-600 hover:bg-green-700 border-green-600"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}