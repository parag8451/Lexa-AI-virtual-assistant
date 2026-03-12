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

// Rate limiting config
const RATE_LIMIT_MAX_REQUESTS = 30; // requests per window
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window

// Input validation limits
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;

// Map frontend model names to actual AI gateway model IDs
const MODEL_MAPPING: Record<string, string> = {
  "lexa-fast": "google/gemini-3-flash-preview",
  "lexa-balanced": "google/gemini-2.5-flash",
  "lexa-pro": "google/gemini-2.5-pro",
  "lexa-expert": "google/gemini-2.5-pro",
  "lexa-ultra": "openai/gpt-5",
};

// System prompt optimized for structured, clear responses
const SYSTEM_PROMPT = `You are Lexa AI, a highly intelligent and helpful AI assistant. Follow these formatting rules strictly:

**Response Structure:**
1. For questions or explanations: Use clear headings, numbered lists, and bullet points
2. For math problems: Show step-by-step solutions with clear numbering (Step 1, Step 2, etc.)
3. For comparisons: Use tables or organized lists
4. For code: Always specify the language and include comments

**Formatting Rules:**
- Use **bold** for important terms and concepts
- Use numbered lists (1. 2. 3.) for sequential steps or rankings
- Use bullet points (•) for non-sequential items
- Use headings (## or ###) to organize long responses into sections
- For math: Write equations clearly, show each step on a new line
- Use horizontal rules (---) to separate major sections

**Communication Style:**
- Be concise but thorough
- Start with a brief summary or direct answer
- Then provide detailed explanation with proper structure
- End with a summary or recommendation when helpful

Example math formatting:
**Problem:** Calculate 25 × 12

**Solution:**
Step 1: Break down 12 into (10 + 2)
Step 2: Calculate 25 × 10 = 250
Step 3: Calculate 25 × 2 = 50
Step 4: Add the results: 250 + 50 = **300**

**Answer: 300**`;

// Helper to authenticate user
async function authenticateUser(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables not configured");
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    console.error("Auth error:", error?.message);
    return null;
  }

  return { userId: data.user.id };
}

// Server-side rate limiting check
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Service role key not configured for rate limiting");
    // Fail open but log - allow request but flag issue
    return { allowed: true, remaining: 0, resetAt: new Date() };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check rate limit using the database function
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_user_id: userId,
      p_endpoint: "chat",
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (error) {
      console.error("Rate limit check error:", error.message);
      // Fail open on error
      return { allowed: true, remaining: 0, resetAt: new Date() };
    }

    // Get remaining count
    const { data: remainingData } = await supabase.rpc("get_rate_limit_remaining", {
      p_user_id: userId,
      p_endpoint: "chat",
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    const remaining = remainingData?.[0]?.remaining ?? 0;
    const resetAt = remainingData?.[0]?.reset_at ? new Date(remainingData[0].reset_at) : new Date();

    return { allowed: data === true, remaining, resetAt };
  } catch (err) {
    console.error("Rate limit error:", err);
    return { allowed: true, remaining: 0, resetAt: new Date() };
  }
}

// Validate input messages
function validateInput(messages: any[]): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }
  
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages (max ${MAX_MESSAGES})` };
  }
  
  for (const msg of messages) {
    if (typeof msg.content !== "string") {
      return { valid: false, error: "Invalid message format" };
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight immediately
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check server-side rate limit
    const rateLimit = await checkRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait and try again.",
          retry_after: retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(1, retryAfter)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          } 
        }
      );
    }

    const { messages, model } = await req.json();
    
    // Validate input
    const validation = validateInput(messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map frontend model names to gateway model IDs, default to fast model
    const requestedModel = model || "lexa-fast";
    const selectedModel = MODEL_MAPPING[requestedModel] || requestedModel;
    
    // If still not a valid model, use default
    const finalModel = selectedModel.includes("/") ? selectedModel : "google/gemini-3-flash-preview";
    
    console.log(`[${Date.now() - startTime}ms] Chat request - user: ${auth.userId}, model: ${finalModel}, messages: ${messages.length}, remaining: ${rateLimit.remaining}`);

    // Stream response from AI gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        // Optimize for speed
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    console.log(`[${Date.now() - startTime}ms] AI gateway response status: ${response.status}`);

    if (!response.ok) {
      // Log detailed error server-side only for debugging
      console.error(`AI gateway error: ${response.status}`);
      const errorBody = await response.text().catch(() => "");
      if (errorBody) console.error(`Error details: ${errorBody.substring(0, 500)}`);
      
      // Return generic error message to client - don't expose internal status codes
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return streaming response with rate limit headers
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
