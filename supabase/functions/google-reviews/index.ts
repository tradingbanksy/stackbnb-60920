import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://stackbnb-60920.lovable.app',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (allowedOrigins.includes(origin) || origin.endsWith('.lovable.app'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceDetailsResponse {
  result?: {
    name: string;
    place_id: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReview[];
    url?: string;
  };
  status: string;
  error_message?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeId, searchQuery, lat, lng } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_REVIEWS_API_KEY');

    if (!apiKey) {
      console.error('GOOGLE_REVIEWS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let googlePlaceId = placeId;

    // If no placeId provided, search for the place first
    if (!googlePlaceId && searchQuery) {
      console.log('Searching for place:', searchQuery);
      
      let searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;
      
      // Add location bias if coordinates provided
      if (lat && lng) {
        searchUrl += `&locationbias=circle:5000@${lat},${lng}`;
      }

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      console.log('Place search response:', JSON.stringify(searchData));

      if (searchData.candidates && searchData.candidates.length > 0) {
        googlePlaceId = searchData.candidates[0].place_id;
        console.log('Found place_id:', googlePlaceId);
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Place not found',
            reviews: [],
            googleMapsUrl: null
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!googlePlaceId) {
      return new Response(
        JSON.stringify({ error: 'No place ID or search query provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch place details with reviews
    console.log('Fetching place details for:', googlePlaceId);
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=name,rating,user_ratings_total,reviews,url&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData: PlaceDetailsResponse = await detailsResponse.json();
    
    console.log('Place details status:', detailsData.status);

    if (detailsData.status !== 'OK') {
      console.error('Place details error:', detailsData.error_message || detailsData.status);
      return new Response(
        JSON.stringify({ 
          error: detailsData.error_message || 'Failed to fetch place details',
          reviews: [],
          googleMapsUrl: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = detailsData.result;
    
    return new Response(
      JSON.stringify({
        placeId: googlePlaceId,
        name: result?.name,
        rating: result?.rating,
        totalReviews: result?.user_ratings_total,
        reviews: result?.reviews || [],
        googleMapsUrl: result?.url || `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-reviews function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
