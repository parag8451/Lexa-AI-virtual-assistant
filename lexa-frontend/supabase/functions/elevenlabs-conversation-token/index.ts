import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from env or use defaults
const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL") || "",
  "https://your-heart-ai.lovable.app",
  "https://id-preview--a8744b7d-1be4-4fce-90ac-07d3d28c21b9.lovable.app",
].filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is allowed (include both lovable.app and lovableproject.com for dev)
  const allowedOrigin = origin && (
    ALLOWED_ORIGINS.some(allowed => origin === allowed) || 
    origin.endsWith(".lovable.app") ||
    origin.endsWith(".lovableproject.com")
  ) ? origin : ALLOWED_ORIGINS[0] || "*";
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}



// Helper to authenticate user
async function authenticateUser(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    return null;
  }

  return { userId: data.user.id };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Voice service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get agent ID from request or use default
    const { agentId } = await req.json().catch(() => ({ agentId: null }));
    
    // Validate agentId format if provided - only allow alphanumeric, underscore, hyphen
    if (agentId !== null && agentId !== undefined) {
      if (typeof agentId !== "string" || agentId.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(agentId)) {
        return new Response(
          JSON.stringify({ error: "Invalid agent ID format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // For now, we'll use the signed URL approach for more flexibility
    // This generates a single-use token for the conversation
    console.log(`Generating conversation token for user ${auth.userId}`);

    // Generate a signed URL for WebSocket connection - use URL API for safe encoding
    const apiUrl = new URL("https://api.elevenlabs.io/v1/convai/conversation/get-signed-url");
    if (agentId) {
      apiUrl.searchParams.set("agent_id", agentId);
    }
    const tokenResponse = await fetch(apiUrl.toString(),
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("ElevenLabs token error:", tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate voice session" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { signed_url } = await tokenResponse.json();

    console.log("Conversation token generated successfully");

    return new Response(
      JSON.stringify({ signed_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Token generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to initialize voice chat" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
