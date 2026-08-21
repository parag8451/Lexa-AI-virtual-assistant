import { supabase } from "@/integrations/supabase/client";

export interface ChatMessagePayload {
  role: "user" | "assistant" | "system" | "model";
  content: string;
}

export interface AttachmentPayload {
  name: string;
  type: string;
  data: string; // Base64 data
  textContent?: string;
}

export interface StreamOptions {
  messages: ChatMessagePayload[];
  attachments?: AttachmentPayload[];
  model?: string;
  webSearch?: boolean;
  mode?: string;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

const CHAT_ENDPOINT = (import.meta.env.VITE_CHAT_ENDPOINT as string) || "/api/chat";
const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const EDGE_CHAT_URL = SUPABASE_BASE_URL ? `${SUPABASE_BASE_URL}/functions/v1/chat` : "";

/**
 * Unified Chat Service for Lexa AI
 * Handles API calls, stream decoding, error translation, and fallback handling.
 */
export async function streamChatResponse({
  messages,
  attachments = [],
  model = "gemini-3.5-flash",
  webSearch = false,
  mode = "assistant",
  onDelta,
  onDone,
  onError,
  signal,
}: StreamOptions): Promise<void> {
  const abortController = new AbortController();
  if (signal) {
    signal.addEventListener("abort", () => abortController.abort());
  }

  // SECURITY: Input Validation & Bounds Checking
  if (!messages || messages.length === 0) {
    throw new Error("Message history cannot be empty");
  }
  if (messages.length > 100) {
    throw new Error("Message history exceeds maximum allowed length (100)");
  }
  
  // Validate individual message sizes to prevent payload DoS
  const MAX_CHARS_PER_MSG = 150000; // ~50k tokens
  for (const msg of messages) {
    if (msg.content && msg.content.length > MAX_CHARS_PER_MSG) {
      throw new Error("Individual message length exceeds maximum limit");
    }
  }

  // Validate allowed models to prevent prompt injection / model overriding
  const ALLOWED_MODELS = [
    "gemini-3.5-flash", "gemini-3.5-pro", "gemini-3.5-flash-8b",
    "gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet",
    "llama-3.1-70b-versatile", "llama3-8b-8192"
  ];
  const validatedModel = ALLOWED_MODELS.includes(model) ? model : "gemini-3.5-flash";

  const ALLOWED_MODES = ["assistant", "design", "code"];
  const validatedMode = ALLOWED_MODES.includes(mode) ? mode : "assistant";

  // Get current auth session if present
  let authHeader: Record<string, string> = {};
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      authHeader = { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Unauthenticated guest requests handled by API backend
  }

  const payload = {
    messages,
    attachments,
    model: validatedModel,
    webSearch,
    mode: validatedMode,
  };

  let response: Response | null = null;
  let lastError: Error | null = null;

  // 1. Primary: Try Hono backend endpoint (/api/chat)
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
  } catch (err) {
    lastError = err instanceof Error ? err : new Error(String(err));
  }

  // 2. Fallback: Try Supabase Edge Function (/functions/v1/chat) if Hono endpoint fails
  if ((!response || !response.ok) && EDGE_CHAT_URL) {
    try {
      response = await fetch(EDGE_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });
    } catch (err) {
      if (!lastError) lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!response || !response.ok) {
    const statusText = response ? ` (Status ${response.status})` : "";
    const errorMsg = lastError?.message || `Failed to connect to AI server${statusText}.`;
    const finalErr = new Error(errorMsg);
    onError?.(finalErr);
    throw finalErr;
  }

  if (!response.body) {
    const err = new Error("Empty response body from AI server.");
    onError?.(err);
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === "[DONE]") {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const delta =
              parsed?.choices?.[0]?.delta?.content ||
              (parsed.type === "text_delta" ? parsed.text : undefined) ||
              parsed.text ||
              (parsed.type === "content_block_delta" ? parsed.delta?.text : undefined);

            if (delta) {
              onDelta(delta);
            } else if (parsed.type === "message_stop") {
              onDone();
              return;
            } else if (parsed.finalText) {
              onDelta(parsed.finalText);
              onDone();
              return;
            }
          } catch {
            // Ignore partial SSE parsing errors
          }
        }
      }
    }

    if (buffer.trim().startsWith("data: ")) {
      const dataStr = buffer.trim().slice(6).trim();
      if (dataStr !== "[DONE]") {
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content || parsed.text;
          if (delta) onDelta(delta);
        } catch {}
      }
    }

    onDone();
  } finally {
    reader.releaseLock();
  }
}
