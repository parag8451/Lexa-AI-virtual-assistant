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

// Rate limiting config - more restrictive for search (API costs)
const RATE_LIMIT_MAX_REQUESTS = 10; // requests per window
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window

// Input validation limits
const MAX_QUERY_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 10;

interface SearchResult {
  content: string;
  citations: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

const SYSTEM_PROMPT = `You are Lexa AI, a helpful AI assistant with access to real-time web search. Your responses should be:

## RESPONSE FORMAT
- Use clear headings with ## for main sections
- Use **bold** for key terms and important information
- Use numbered lists (1. 2. 3.) for sequential steps or rankings
- Use bullet points (•) for non-sequential lists
- Include relevant statistics and data when available
- Always cite sources inline using [Source Name](URL) format

## SEARCH GUIDELINES
- Prioritize recent and authoritative sources
- Cross-reference multiple sources for accuracy
- Clearly distinguish between facts and opinions
- Provide context for statistics (when, where, who measured)

## ANSWER STRUCTURE
1. **Quick Answer**: Start with a concise 1-2 sentence summary
2. **Details**: Expand with relevant information organized logically
3. **Key Takeaways**: End with actionable insights or summary points

Always be helpful, accurate, and cite your sources.`;

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

// Server-side rate limiting check
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Service role key not configured for rate limiting");
    return { allowed: true, remaining: 0, resetAt: new Date() };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_user_id: userId,
      p_endpoint: "web-search",
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (error) {
      console.error("Rate limit check error:", error.message);
      return { allowed: true, remaining: 0, resetAt: new Date() };
    }

    const { data: remainingData } = await supabase.rpc("get_rate_limit_remaining", {
      p_user_id: userId,
      p_endpoint: "web-search",
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

    // Check server-side rate limit
    const rateLimit = await checkRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          content: "You've reached the search limit. Please wait a moment before searching again.",
          citations: [],
          rate_limited: true,
          retry_after_seconds: Math.max(1, retryAfter),
        }),
        { 
          status: 200, // Return 200 with rate_limited flag for graceful handling
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          } 
        }
      );
    }

    const { query, conversationHistory, searchModel } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Search service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Model selection - default to gemini-2.0-flash
    const modelMap: Record<string, string> = {
      "gemini-2.0-flash": "gemini-2.0-flash",
      "gemini-2.5-pro": "gemini-2.5-pro-preview-05-06",
      "gemini-2.5-flash": "gemini-2.5-flash-preview-05-20",
    };
    const selectedModel = modelMap[searchModel] || "gemini-2.0-flash";

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query too long (max ${MAX_QUERY_LENGTH} characters)` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[web-search] User ${auth.userId} query: ${query.substring(0, 50)}... remaining: ${rateLimit.remaining}`);
    const startTime = Date.now();

    // Build conversation for context (limit to last 4 messages to reduce tokens)
    const history = Array.isArray(conversationHistory) 
      ? conversationHistory.slice(-Math.min(MAX_HISTORY_MESSAGES, 4))
      : [];
      
    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: typeof msg.content === "string" ? msg.content.substring(0, 2000) : "" }],
      })),
      {
        role: "user",
        parts: [{ text: query }],
      },
    ];

    console.log(`[web-search] Using model: ${selectedModel}`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages,
          tools: [{ googleSearch: {} }],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      // Upstream rate limit / overload
      if (response.status === 429 || response.status === 503) {
        console.log(`[web-search] Upstream busy (${response.status}); returning friendly message`);
        const body = await response.text().catch(() => "");
        if (body) console.log(`[web-search] Upstream busy body: ${body.substring(0, 500)}`);

        return new Response(
          JSON.stringify({
            content: "I'm getting too many requests to search the web right now. Please try again in ~30 seconds.",
            citations: [],
            rate_limited: true,
            retry_after_seconds: 30,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Other errors, don't retry - log server-side only
      console.error("[web-search] Gemini API error:", response.status);
      const errorBody = await response.text().catch(() => "");
      if (errorBody) console.error("[web-search] Error body:", errorBody.substring(0, 2000));
      throw new Error("Search service temporarily unavailable");
    }

    const data = await response.json();
    const elapsed = Date.now() - startTime;
    console.log(`[web-search] Response received in ${elapsed}ms`);

    // Extract content and citations from the response
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.map((p: { text?: string }) => p.text).filter(Boolean).join("") || "";
    
    // Extract grounding metadata for citations
    const groundingMetadata = candidate?.groundingMetadata;
    const citations: SearchResult["citations"] = [];
    const seenUrls = new Set<string>();

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web && chunk.web.uri && !seenUrls.has(chunk.web.uri)) {
          seenUrls.add(chunk.web.uri);
          try {
            citations.push({
              title: chunk.web.title || new URL(chunk.web.uri).hostname,
              url: chunk.web.uri,
              snippet: "",
            });
          } catch {
            // Invalid URL, skip
          }
        }
      }
    }

    console.log(`[web-search] Found ${citations.length} citations`);

    const result: SearchResult = { content, citations };

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[web-search] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Search failed. Please try again.",
        content: "I'm sorry, I couldn't complete the web search. Please try again.",
        citations: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
