import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Navigation, Lightbulb, ExternalLink, Bookmark, BookmarkCheck, Loader2, Car, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

interface MapboxRouteData {
  route: {
    type: string;
    coordinates: [number, number][];
  };
  duration: number;
  durationText: string;
  distance: number;
  distanceText: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  mapboxToken: string;
  steps?: { instruction: string; distance: number; duration: number }[];
}

const TULUM_CENTRO = { lat: 20.2114, lng: -87.4654 };

export function VendorLocationMap({ vendorName, vendorAddress, placeId }: VendorLocationMapProps) {
  const { toast } = useToast();
  const [directionsData, setDirectionsData] = useState<DirectionsData | null>(null);
  const [mapRouteData, setMapRouteData] = useState<MapboxRouteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [itineraryItemId, setItineraryItemId] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Fetch initial directions data
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

  // Fetch Mapbox route when we have vendor location
  useEffect(() => {
    const fetchMapboxRoute = async () => {
      if (!directionsData?.vendorLocation) return;

      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-directions', {
          body: { 
            destinationLat: directionsData.vendorLocation.lat,
            destinationLng: directionsData.vendorLocation.lng
          }
        });

        if (fnError) {
          console.error('Mapbox directions error:', fnError);
          return;
        }

        if (data && !data.error) {
          setMapRouteData(data);
        }
      } catch (err) {
        console.error('Error fetching Mapbox route:', err);
      }
    };

    fetchMapboxRoute();
  }, [directionsData?.vendorLocation]);

  // Initialize Mapbox map when route data is available
  useEffect(() => {
    if (!mapContainer.current || !mapRouteData?.mapboxToken || !mapRouteData?.route) return;
    if (map.current) return; // Already initialized

    try {
      mapboxgl.accessToken = mapRouteData.mapboxToken;

      // Calculate bounds to fit the route
      const coordinates = mapRouteData.route.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number]);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        bounds: bounds,
        fitBoundsOptions: { padding: 40 },
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Add route line
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: mapRouteData.route.coordinates
            }
          }
        });

        // Route outline (darker)
        map.current.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1e40af',
            'line-width': 8,
            'line-opacity': 0.4
          }
        });

        // Route line (primary color)
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.9
          }
        });

        // Add origin marker (Tulum Centro)
        const originEl = document.createElement('div');
        originEl.className = 'origin-marker';
        originEl.innerHTML = `
          <div style="
            width: 32px; 
            height: 32px; 
            background: white; 
            border: 3px solid #3b82f6; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          ">
            <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%;"></div>
          </div>
        `;
        new mapboxgl.Marker(originEl)
          .setLngLat([mapRouteData.origin.lng, mapRouteData.origin.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>Tulum Centro</strong><p>Starting point</p>'))
          .addTo(map.current);

        // Add destination marker (Vendor)
        const destEl = document.createElement('div');
        destEl.className = 'destination-marker';
        destEl.innerHTML = `
          <div style="
            width: 36px; 
            height: 36px; 
            background: #ef4444; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 12px rgba(239,68,68,0.4);
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `;
        new mapboxgl.Marker(destEl)
          .setLngLat([mapRouteData.destination.lng, mapRouteData.destination.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${vendorName}</strong><p>${mapRouteData.distanceText} • ${mapRouteData.durationText}</p>`))
          .addTo(map.current);

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        setMapLoaded(true);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapRouteData, vendorName]);

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
            travel_distance: mapRouteData?.distanceText || directionsData?.distance,
            travel_duration: mapRouteData?.durationText || directionsData?.duration,
            travel_duration_seconds: mapRouteData?.duration || directionsData?.durationValue,
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
        <Skeleton className="h-48 w-full" />
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

  const displayDistance = mapRouteData?.distanceText || directionsData?.distance;
  const displayDuration = mapRouteData?.durationText || directionsData?.duration;

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
      {/* Interactive Mapbox Map */}
      {directionsData?.vendorLocation && !mapError ? (
        <div className="relative h-48 w-full cursor-pointer group">
          <div 
            ref={mapContainer} 
            className="absolute inset-0"
            onClick={(e) => {
              // Only open if not interacting with map controls
              if ((e.target as HTMLElement).closest('.mapboxgl-ctrl')) return;
            }}
          />
          
          {/* Loading overlay */}
          {!mapLoaded && mapRouteData && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Fallback stylized map while loading Mapbox data */}
          {!mapRouteData && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-teal-950/30">
              {/* Subtle map grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }} />
              </div>
              
              {/* Curved route path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 192" preserveAspectRatio="xMidYMid slice">
                <path 
                  d="M 80 96 Q 200 50 320 96" 
                  fill="none" 
                  stroke="url(#routeGradient)" 
                  strokeWidth="3" 
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Origin */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-muted border-2 border-primary/40 flex items-center justify-center shadow-md">
                  <CircleDot className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
                  Tulum Centro
                </span>
              </div>

              {/* Destination */}
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

              {/* Loading indicator */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm shadow-sm border border-border/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Loading route...</span>
              </div>
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />

          {/* Open in Maps button */}
          <button
            onClick={openInGoogleMaps}
            className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1.5 shadow-sm border border-border/50 hover:bg-background transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open in Maps
          </button>
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
            {(displayDistance || displayDuration) && (
              <div className="flex items-center gap-2 mt-2">
                {displayDistance && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Car className="h-3 w-3" />
                    <span>{displayDistance}</span>
                  </div>
                )}
                {displayDuration && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{displayDuration}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Arrival Tips */}
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
