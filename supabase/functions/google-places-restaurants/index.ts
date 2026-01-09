import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  vicinity?: string;
  photos?: { photo_reference: string }[];
  geometry?: {
    location: { lat: number; lng: number };
  };
  opening_hours?: { open_now?: boolean };
  types?: string[];
}

interface GooglePlacesResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_REVIEWS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_REVIEWS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tulum coordinates
    const location = '20.2114,-87.4654';
    const radius = 10000; // 10km radius
    const type = 'restaurant';
    
    console.log('Fetching top restaurants in Tulum...');
    
    // Fetch restaurants using Google Places Nearby Search
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&rankby=prominence&key=${apiKey}`;
    
    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: data.error_message || `API error: ${data.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${data.results?.length || 0} restaurants`);

    // Transform and sort by rating
    const restaurants = (data.results || [])
      .filter(place => place.rating && place.rating >= 4.0)
      .sort((a, b) => {
        // Sort by rating first, then by number of reviews
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
      })
      .slice(0, 12)
      .map(place => ({
        id: place.place_id,
        name: place.name,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        priceLevel: place.price_level,
        address: place.vicinity,
        isOpen: place.opening_hours?.open_now,
        photo: place.photos?.[0]?.photo_reference 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
          : null,
        location: place.geometry?.location,
        types: place.types?.filter(t => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t)),
      }));

    console.log(`Returning ${restaurants.length} top-rated restaurants`);

    return new Response(
      JSON.stringify({ success: true, restaurants }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});