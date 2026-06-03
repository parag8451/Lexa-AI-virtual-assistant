import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, model, systemPrompt } = await req.json();

    // Filter out system messages and reconstruct
    const userMessages: Message[] = messages.filter(
      (m: Message) => m.role !== "system"
    );

    // Call Anthropic Claude API with streaming
    const response = await client.messages.create({
      model: model || "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt || "You are Lexa, a helpful AI assistant.",
      messages: userMessages,
      stream: true,
    });

    // Convert to server-sent events stream
    let eventText = "";

    const readable = ReadableStream.from(
      (async function* () {
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            eventText += event.delta.text;
            yield `data: ${JSON.stringify({
              type: "content_block_delta",
              delta: { type: "text_delta", text: event.delta.text },
            })}\n\n`;
          } else if (event.type === "message_stop") {
            yield `data: ${JSON.stringify({
              type: "message_stop",
              message: { content: [{ type: "text", text: eventText }] },
            })}\n\n`;
          }
        }
      })()
    );

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
