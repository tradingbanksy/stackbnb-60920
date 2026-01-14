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

interface PlaceReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: {
    text?: string;
    languageCode?: string;
  };
  originalText?: {
    text?: string;
    languageCode?: string;
  };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  publishTime?: string;
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

    // If no placeId provided, search for the place first using new Text Search API
    if (!googlePlaceId && searchQuery) {
      console.log('Searching for place:', searchQuery);
      
      const searchBody: Record<string, unknown> = {
        textQuery: searchQuery,
        maxResultCount: 1,
      };
      
      // Add location bias if coordinates provided
      if (lat && lng) {
        searchBody.locationBias = {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 5000.0
          }
        };
      }

      const searchResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify(searchBody)
      });
      
      const searchData = await searchResponse.json();
      console.log('Place search response:', JSON.stringify(searchData));

      if (searchData.places && searchData.places.length > 0) {
        googlePlaceId = searchData.places[0].id;
        console.log('Found place_id:', googlePlaceId);
      } else {
        console.log('No places found for query:', searchQuery);
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

    // Fetch place details with reviews using new Places API
    console.log('Fetching place details for:', googlePlaceId);
    
    const detailsResponse = await fetch(`https://places.googleapis.com/v1/places/${googlePlaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,googleMapsUri'
      }
    });
    
    const detailsData = await detailsResponse.json();
    console.log('Place details response status:', detailsResponse.status);

    if (!detailsResponse.ok) {
      console.error('Place details error:', JSON.stringify(detailsData));
      return new Response(
        JSON.stringify({ 
          error: detailsData.error?.message || 'Failed to fetch place details',
          reviews: [],
          googleMapsUrl: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform reviews from new API format to expected format
    const transformedReviews: GoogleReview[] = (detailsData.reviews || []).map((review: PlaceReview) => ({
      author_name: review.authorAttribution?.displayName || 'Anonymous',
      author_url: review.authorAttribution?.uri,
      profile_photo_url: review.authorAttribution?.photoUri,
      rating: review.rating || 0,
      relative_time_description: review.relativePublishTimeDescription || '',
      text: review.text?.text || review.originalText?.text || '',
      time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : 0
    }));

    console.log(`Found ${transformedReviews.length} reviews for place`);
    
    return new Response(
      JSON.stringify({
        placeId: googlePlaceId,
        name: detailsData.displayName?.text,
        rating: detailsData.rating,
        totalReviews: detailsData.userRatingCount,
        reviews: transformedReviews,
        googleMapsUrl: detailsData.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
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
