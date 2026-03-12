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

// Input validation limits (10MB base64 = ~7.5MB raw audio)
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

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

    const { audio } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Speech service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!audio || typeof audio !== "string") {
      return new Response(
        JSON.stringify({ error: "Audio data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate audio size
    if (audio.length > MAX_AUDIO_SIZE) {
      return new Response(
        JSON.stringify({ error: "Audio file too large (max 10MB)" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`STT request from user ${auth.userId}`);

    // Decode base64 audio
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for ElevenLabs
    const formData = new FormData();
    formData.append("file", new Blob([bytes], { type: "audio/webm" }), "audio.webm");
    formData.append("model_id", "scribe_v1");

    const response = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Log detailed error server-side only
      console.error("ElevenLabs STT error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Transcription failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("STT transcription completed");

    return new Response(
      JSON.stringify({ text: data.text || "" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("STT error:", error);
    return new Response(
      JSON.stringify({ error: "Transcription failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
