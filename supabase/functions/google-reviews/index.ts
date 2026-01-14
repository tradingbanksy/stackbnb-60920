import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
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

    // If no placeId provided, search for the place first using legacy Find Place API
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

      if (searchData.status === 'OK' && searchData.candidates && searchData.candidates.length > 0) {
        googlePlaceId = searchData.candidates[0].place_id;
        console.log('Found place_id:', googlePlaceId);
      } else {
        console.log('No places found for query:', searchQuery, 'Status:', searchData.status);
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

    // Fetch place details with reviews using legacy Places API
    console.log('Fetching place details for:', googlePlaceId);
    
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=place_id,name,rating,user_ratings_total,reviews,url&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    console.log('Place details response status:', detailsData.status);

    if (detailsData.status !== 'OK') {
      console.error('Place details error:', JSON.stringify(detailsData));
      return new Response(
        JSON.stringify({ 
          error: detailsData.error_message || `API returned status: ${detailsData.status}`,
          reviews: [],
          googleMapsUrl: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = detailsData.result;
    const reviews: GoogleReview[] = (result.reviews || []).map((review: GoogleReview) => ({
      author_name: review.author_name || 'Anonymous',
      author_url: review.author_url,
      profile_photo_url: review.profile_photo_url,
      rating: review.rating || 0,
      relative_time_description: review.relative_time_description || '',
      text: review.text || '',
      time: review.time || 0
    }));

    console.log(`Found ${reviews.length} reviews for place`);
    
    return new Response(
      JSON.stringify({
        placeId: googlePlaceId,
        name: result.name,
        rating: result.rating,
        totalReviews: result.user_ratings_total,
        reviews: reviews,
        googleMapsUrl: result.url || `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
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
