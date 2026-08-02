import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Model mapping for Anthropic Claude
const MODEL_MAPPING: Record<string, string> = {
  "lexa-fast": "claude-3-5-haiku-20241022",
  "lexa-balanced": "claude-3-5-sonnet-20241022",
  "lexa-pro": "claude-3-5-sonnet-20241022",
  "lexa-expert": "claude-3-opus-20250219",
  "lexa-ultra": "claude-3-opus-20250219",
};

// Define tools that Claude can use
const TOOLS = [
  {
    name: "web_search",
    description: "Search the web for current information",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_current_time",
    description: "Get the current date and time",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "calculator",
    description: "Perform mathematical calculations",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "A mathematical expression to evaluate"
        }
      },
      required: ["expression"]
    }
  }
];

// Get allowed origins from env or use defaults
const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL") || "",
].filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some((allowed) => origin === allowed)
    ? origin
    : ALLOWED_ORIGINS[0] || "*";

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

// System prompt optimized for function calling
const SYSTEM_PROMPT = `You are Lexa AI, a highly intelligent and helpful AI assistant. You have access to tools to help answer questions and complete tasks.

IMPORTANT RULES:
1. **Respond ONLY to what the user asks** - nothing more, nothing less
2. **Match response length to the request** - if they say "hi", reply with a brief acknowledgement only
3. **NO extra information** - no bullet points, lists, or suggestions unless specifically asked
4. **NO formatting overhead** - keep it simple and direct
5. **Be concise** - answer the question briefly, then stop
6. **Only add structure if requested** - tables, lists, or headings only when the user asks for them

- Examples:
- If user says "hi" → Reply: "How can I help?"
- If user asks "what's 2+2?" → Reply: "4"
- If user says "explain quantum physics" → Give explanation, but keep it focused on what they asked
- If user wants step-by-step → Then use numbered steps

When you need tools (web search, calculator), use them quietly and just present the result.`;

// Tool execution functions
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "get_current_time": {
      const now = new Date();
      return JSON.stringify({
        time: now.toISOString(),
        unix_timestamp: Math.floor(now.getTime() / 1000),
        readable: now.toLocaleString()
      });
    }
    
    case "calculator": {
      try {
        const expr = input.expression as string;
        // Simple calculator - only allow safe expressions
        const result = Function('"use strict"; return (' + expr + ')')();
        return JSON.stringify({ result, expression: expr });
      } catch (err) {
        return JSON.stringify({ error: "Invalid expression", expression: input.expression });
      }
    }
    
    case "web_search": {
      const query = input.query as string;
      // Placeholder - in production, integrate with Brave Search API
      return JSON.stringify({
        results: [
          {
            title: "Search Result",
            snippet: "This is a placeholder web search result. In production, integrate with Brave Search or Serper API.",
            url: "https://example.com"
          }
        ],
        query
      });
    }
    
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map frontend model names to Claude model IDs, default to balanced model
    const requestedModel = model || "lexa-balanced";
    const finalModel = MODEL_MAPPING[requestedModel] || "claude-3-5-sonnet-20241022";
    
    console.log(`[${Date.now() - startTime}ms] Chat request - user: ${auth.userId}, model: ${finalModel}, messages: ${messages.length}, remaining: ${rateLimit.remaining}`);

    // Build Anthropic API request
    const claudeMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Stream response from Anthropic API
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: finalModel,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: claudeMessages,
          stream: true,
        }),
      }
    );

    console.log(`[${Date.now() - startTime}ms] Anthropic API response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Anthropic API error: ${response.status}`);
      const errorBody = await response.text().catch(() => "");
      if (errorBody) console.error(`Error details: ${errorBody.substring(0, 500)}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform Anthropic SSE stream to OpenAI-compatible SSE stream for the frontend
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              // Handle Anthropic content_block_delta events
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                const content = parsed.delta.text || "";
                if (content) {
                  const openAiChunk = {
                    choices: [{ delta: { content } }],
                  };
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
                }
              }
              // Check for finish reason
              const finishReason = parsed.candidates?.[0]?.finishReason;
              if (finishReason && finishReason !== "STOP") {
                // Still send done
              }
              if (finishReason === "STOP") {
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      },
    });

    // Return streaming response with rate limit headers
    return new Response(response.body!.pipeThrough(transformStream), {
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
