import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to verify identity
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { role } = body;

    console.log(`Assigning role '${role}' to user ${user.id}`);

    // Validate role is one of allowed values
    const validRoles = ["host", "vendor", "user"];
    if (!role || !validRoles.includes(role)) {
      console.error(`Invalid role requested: ${role}`);
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 'host', 'vendor', or 'user'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS and insert the role
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user already has this role
    const { data: existingRole, error: checkError } = await serviceSupabase
      .from("user_roles")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing role:", checkError.message);
      return new Response(
        JSON.stringify({ error: "Failed to check existing role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingRole) {
      // User already has a role - update it
      const { error: updateError } = await serviceSupabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating role:", updateError.message);
        return new Response(
          JSON.stringify({ error: "Failed to update role" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Successfully updated role to '${role}' for user ${user.id}`);
    } else {
      // Insert new role
      const { error: insertError } = await serviceSupabase
        .from("user_roles")
        .insert({ user_id: user.id, role });

      if (insertError) {
        console.error("Error inserting role:", insertError.message);
        return new Response(
          JSON.stringify({ error: "Failed to assign role" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Successfully assigned role '${role}' to user ${user.id}`);
    }

    return new Response(
      JSON.stringify({ success: true, role }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in assign-role:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
