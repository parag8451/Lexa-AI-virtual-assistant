import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

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
  try {
    // Get the current user's session token for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    
    // SECURITY: Require authentication - do not fallback to publishable key
    if (!session?.access_token) {
      throw new Error("Please sign in to continue.");
    }
    const token = session.access_token;

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

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: fullMessages, model }),
      signal,
    });

    if (!resp.ok) {
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

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          /* ignore partial leftovers */
        }
      }
    }

    onDone();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      onDone();
      return;
    }
    if (onError && error instanceof Error) {
      onError(error);
    } else {
      console.error("Stream error:", error);
    }
    onDone();
  }
}
