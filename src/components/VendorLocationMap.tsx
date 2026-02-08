import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Navigation, Lightbulb, ExternalLink, Bookmark, BookmarkCheck, Loader2, Car, CircleDot, ChevronDown, ChevronUp, ArrowUp, CornerDownRight, CornerDownLeft, RotateCcw, MoveRight } from "lucide-react";
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
  /** "directions" shows the full route from Tulum Centro; "pin" shows only the vendor location marker */
  mode?: 'directions' | 'pin';
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

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
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
  steps?: RouteStep[];
}

const TULUM_CENTRO = { lat: 20.2114, lng: -87.4654 };

export function VendorLocationMap({ vendorName, vendorAddress, placeId, mode = 'directions' }: VendorLocationMapProps) {
  const isPinMode = mode === 'pin';
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
  const [showDirections, setShowDirections] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const carMarker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
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

  // Fetch Mapbox route when we have vendor location (skip in pin mode)
  useEffect(() => {
    if (isPinMode) return;
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
  }, [directionsData?.vendorLocation, isPinMode]);

  // In pin mode, fetch just the Mapbox token and init map centered on vendor
  useEffect(() => {
    if (!isPinMode || !directionsData?.vendorLocation) return;
    if (!mapContainer.current || map.current) return;

    const initPinMap = async () => {
      try {
        // Fetch token via mapbox-directions (we just need the token)
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-directions', {
          body: { 
            destinationLat: directionsData.vendorLocation!.lat,
            destinationLng: directionsData.vendorLocation!.lng
          }
        });

        if (fnError || !data?.mapboxToken) {
          console.error('Could not get Mapbox token:', fnError);
          setMapError(true);
          return;
        }

        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = data.mapboxToken;
        const { lat, lng } = directionsData.vendorLocation!;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [lng, lat],
          zoom: 15,
          attributionControl: false,
        });

        map.current.on('load', () => {
          if (!map.current) return;

          // Add vendor marker
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
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${vendorName}</strong>`))
            .addTo(map.current!);

          map.current!.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
          setMapLoaded(true);
        });

      } catch (err) {
        console.error('Error initializing pin map:', err);
        setMapError(true);
      }
    };

    initPinMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isPinMode, directionsData?.vendorLocation, vendorName]);

  // Initialize Mapbox map when route data is available (directions mode only)
  useEffect(() => {
    if (isPinMode) return;
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
        attributionControl: false, // Hide Mapbox attribution/logo
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

        // Add car marker for animation
        const carEl = document.createElement('div');
        carEl.className = 'car-marker';
        carEl.innerHTML = `
          <div style="
            width: 28px; 
            height: 28px; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            border: 2px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 3px 12px rgba(16,185,129,0.5);
            transition: transform 0.1s ease-out;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
        `;
        carMarker.current = new mapboxgl.Marker(carEl)
          .setLngLat([mapRouteData.origin.lng, mapRouteData.origin.lat])
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (carMarker.current) {
        carMarker.current.remove();
        carMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapRouteData, vendorName]);

  // Animate car along route
  const animateCar = useCallback(() => {
    if (!mapRouteData?.route?.coordinates || !carMarker.current) return;
    
    const coordinates = mapRouteData.route.coordinates;
    const totalPoints = coordinates.length;
    let currentIndex = 0;
    const animationDuration = 8000; // 8 seconds for full route
    const startTime = performance.now();

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      currentIndex = Math.floor(easedProgress * (totalPoints - 1));
      const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);
      
      // Interpolate between current and next point
      const segmentProgress = (easedProgress * (totalPoints - 1)) % 1;
      const currentCoord = coordinates[currentIndex];
      const nextCoord = coordinates[nextIndex];
      
      const interpolatedLng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * segmentProgress;
      const interpolatedLat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * segmentProgress;
      
      carMarker.current?.setLngLat([interpolatedLng, interpolatedLat]);

      // Calculate rotation based on direction
      if (currentIndex < totalPoints - 1) {
        const dx = nextCoord[0] - currentCoord[0];
        const dy = nextCoord[1] - currentCoord[1];
        const rotation = Math.atan2(dy, dx) * (180 / Math.PI);
        const el = carMarker.current?.getElement();
        if (el) {
          el.style.transform = `rotate(${rotation}deg)`;
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        // Reset car to start after a delay
        setTimeout(() => {
          carMarker.current?.setLngLat([coordinates[0][0], coordinates[0][1]]);
          const el = carMarker.current?.getElement();
          if (el) el.style.transform = '';
        }, 1000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [mapRouteData]);

  // Helper to get direction icon based on instruction text
  const getDirectionIcon = (instruction: string) => {
    const lowerInstruction = instruction.toLowerCase();
    if (lowerInstruction.includes('right')) return <CornerDownRight className="h-4 w-4" />;
    if (lowerInstruction.includes('left')) return <CornerDownLeft className="h-4 w-4" />;
    if (lowerInstruction.includes('u-turn') || lowerInstruction.includes('uturn')) return <RotateCcw className="h-4 w-4" />;
    if (lowerInstruction.includes('straight') || lowerInstruction.includes('continue')) return <ArrowUp className="h-4 w-4" />;
    if (lowerInstruction.includes('merge') || lowerInstruction.includes('enter')) return <MoveRight className="h-4 w-4" />;
    return <ArrowUp className="h-4 w-4" />;
  };

  // Format distance for display
  const formatStepDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Format duration for display
  const formatStepDuration = (seconds: number) => {
    if (seconds >= 60) {
      return `${Math.round(seconds / 60)} min`;
    }
    return `${Math.round(seconds)} sec`;
  };

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
    if (isPinMode) {
      return <Skeleton className="h-48 w-full rounded-xl" />;
    }
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
    if (isPinMode) {
      return (
        <div className="rounded-xl bg-muted p-4">
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      );
    }
    return (
      <Card className="p-4 border-border/50 bg-card/80 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">{error}</p>
      </Card>
    );
  }

  const displayDistance = mapRouteData?.distanceText || directionsData?.distance;
  const displayDuration = mapRouteData?.durationText || directionsData?.duration;

  // Pin mode: render just the map container, no Card wrapper
  if (isPinMode) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '192px', minHeight: '192px' }}>
        {directionsData?.vendorLocation && !mapError ? (
          <>
            <div 
              ref={mapContainer} 
              className="absolute inset-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Loading overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* Open in Maps button */}
            <div className="absolute bottom-2 right-2">
              <button
                onClick={openInGoogleMaps}
                className="px-2.5 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1.5 shadow-sm border border-border/50 hover:bg-background transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Maps
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-teal-950/30 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Location loading...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
      {/* Interactive Mapbox Map - always render container with explicit dimensions */}
      <div className="relative w-full" style={{ height: '192px', minHeight: '192px' }}>
        {directionsData?.vendorLocation && !mapError ? (
          <>
            <div 
              ref={mapContainer} 
              className="absolute inset-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
              onClick={(e) => {
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
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />
                </div>
                
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

                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-primary/40 flex items-center justify-center shadow-md">
                    <CircleDot className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
                    Tulum Centro
                  </span>
                </div>

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

                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm shadow-sm border border-border/50">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Loading route...</span>
                </div>
              </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            {/* Map controls row */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              {/* Animate journey button (directions mode only) */}
              {!isPinMode && mapLoaded && mapRouteData?.route && (
                <button
                  onClick={animateCar}
                  disabled={isAnimating}
                  className={cn(
                    "px-2.5 py-1.5 rounded-full backdrop-blur-sm text-xs font-medium flex items-center gap-1.5 shadow-sm border transition-all",
                    isAnimating 
                      ? "bg-green-500/90 text-white border-green-500/50" 
                      : "bg-background/90 text-foreground border-border/50 hover:bg-background"
                  )}
                >
                  <Car className={cn("h-3 w-3", isAnimating && "animate-pulse")} />
                  {isAnimating ? "Driving..." : "Animate Route"}
                </button>
              )}
              {(!mapLoaded || isPinMode) && <div />}
              
              {/* Open in Maps button */}
              <button
                onClick={openInGoogleMaps}
                className="px-2.5 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1.5 shadow-sm border border-border/50 hover:bg-background transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Maps
              </button>
            </div>
          </>
        ) : (
          // Fallback when no vendor location - show a placeholder
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-teal-950/30 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Location loading...</p>
            </div>
          </div>
        )}
      </div>
      
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
            
            {/* Distance & Duration Pills (directions mode only) */}
            {!isPinMode && (displayDistance || displayDuration) && (
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

        {/* Turn-by-Turn Directions (directions mode only) */}
        {!isPinMode && mapRouteData?.steps && mapRouteData.steps.length > 0 && (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setShowDirections(!showDirections)}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Turn-by-Turn Directions</span>
                <span className="text-xs text-muted-foreground">({mapRouteData.steps.length} steps)</span>
              </div>
              {showDirections ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {showDirections && (
              <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
                {mapRouteData.steps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {getDirectionIcon(step.instruction)}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        {step.instruction}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatStepDistance(step.distance)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatStepDuration(step.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-start gap-3 p-3 bg-green-500/5">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">End</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600">Arrive at {vendorName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total: {mapRouteData.distanceText} • {mapRouteData.durationText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Arrival Tips (directions mode only) */}
        {!isPinMode && directionsData?.arrivalTips && directionsData.arrivalTips.length > 0 && (
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
