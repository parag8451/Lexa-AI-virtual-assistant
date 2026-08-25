import { supabase } from "@/integrations/supabase/client";

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const CHAT_URL = SUPABASE_BASE_URL ? `${SUPABASE_BASE_URL}/functions/v1/chat` : '';

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

interface StreamChatOptions {
  messages: ChatMessage[];
  model?: string;
  systemPrompt?: string;
  memoryContext?: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * Stream chat responses from Claude via Supabase Edge Function
 * Uses native ReadableStream for efficient token-by-token streaming
 */
export async function streamChat({
  messages,
  model,
  systemPrompt,
  memoryContext,
  onDelta,
  onDone,
  onError,
  signal,
}: StreamChatOptions) {
  if (!CHAT_URL) {
    const err = new Error("Supabase URL is not configured. Please set VITE_SUPABASE_URL in your .env file.");
    onError?.(err);
    throw err;
  }

  const abortController = new AbortController();
  if (signal) {
    signal.addEventListener("abort", () => abortController.abort());
  }

  try {
    // Get the current user's session token for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    
    // SECURITY: Require authentication
    if (!session?.access_token) {
      throw new Error("Please sign in to continue.");
    }
    const authSessionToken = session.access_token;

    // Build messages with system prompt and memory context
    const fullMessages: ChatMessage[] = [];
    
    if (systemPrompt) {
      let system = systemPrompt;
      if (memoryContext) {
        system += `\n\n${memoryContext}`;
      }
      fullMessages.push({ role: "system", content: system });
    } else if (memoryContext) {
      fullMessages.push({ role: "system", content: memoryContext });
    }
    
    fullMessages.push(...messages);

    // Fetch with streaming enabled
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authSessionToken}`,
      },
      body: JSON.stringify({ 
        messages: fullMessages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
        model: model || "lexa-balanced",
        systemPrompt: systemPrompt || undefined,
      }),
      signal: abortController.signal,
    });

    if (!resp.ok) {
      // Handle specific error codes
      if (resp.status === 401) {
        throw new Error("Please sign in to continue.");
      }
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      if (resp.status === 402) {
        throw new Error("Usage limit reached. Please add credits to continue.");
      }
      if (resp.status === 413) {
        throw new Error("Message too long. Please shorten your message.");
      }
      
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error("No response body");
    }

    // Use native ReadableStream for optimal performance
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          // Remove carriage return if present
          if (line.endsWith("\r")) line = line.slice(0, -1);

          // Skip empty lines and comments
          if (line.startsWith(":") || line.trim() === "") continue;

          // Process SSE data lines
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);

            // Check for stream completion
            if (jsonStr === "[DONE]") {
              onDone();
              return;
            }

            try {
              const data = JSON.parse(jsonStr);
              
              // Handle Anthropic SSE events
              if (data.type === "content_block_delta" && data.delta?.type === "text_delta") {
                onDelta(data.delta.text);
              } else if (data.type === "message_stop") {
                onDone();
                return;
              } else if (data.type === "error") {
                throw new Error(data.error || "Unknown streaming error");
              }
            } catch (parseError) {
              if (parseError instanceof SyntaxError) {
                console.warn("Failed to parse SSE line:", line);
              } else {
                throw parseError;
              }
            }
          }
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        console.warn("Incomplete buffer at stream end:", buffer);
      }

      onDone();
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Chat streaming error:", err);
    onError?.(err);
    throw err;
  }
}

/**
 * Pre-warm the edge function with a dummy OPTIONS request
 * This reduces cold start latency on first real request
 */
export async function prewarmChat() {
  if (!CHAT_URL) return; // Skip if not configured

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    // Send a lightweight OPTIONS request to warm up the function
    await fetch(CHAT_URL, {
      method: "OPTIONS",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => {
      // Ignore errors, this is just for prewarming
    });
  } catch {
    // Silently fail - prewarming is optional
  }
}
