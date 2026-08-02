import { Hono } from 'hono';
import { Conversation, User } from '../models/index';
import { z } from 'zod';
import type { AppEnv } from '../types';

const chatRouter = new Hono<AppEnv>();

// Candidate active Gemini models ordered by speed, capability, and availability
const MODEL_CASCADE = [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'model']),
    content: z.string().max(30000, "Message too long"),
  })).min(1, "Messages array cannot be empty").max(100, "Too many messages"),
  model: z.string().optional(),
  webSearch: z.boolean().optional(),
  mode: z.string().optional(),
});

// Map model selection to best candidate list
const getModelCandidates = (requestedModel?: string): string[] => {
  if (!requestedModel) return MODEL_CASCADE;
  const m = requestedModel.toLowerCase();
  
  if (m.includes('pro') || m.includes('expert') || m.includes('ultra') || m.includes('opus')) {
    return ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  }
  if (m.includes('flash') || m.includes('lite') || m.includes('fast')) {
    return ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  }
  return MODEL_CASCADE;
};

// System instruction to ensure intelligent formatting, code syntax, and reasoning
const SYSTEM_INSTRUCTION = `You are Lexa AI, an advanced, highly intelligent virtual AI assistant.
When asked to write code:
- Provide clean, production-ready, well-commented code with correct language tags (e.g. \`\`\`python, \`\`\`javascript, \`\`\`html, \`\`\`tsx).
- Explain key architectural decisions concisely.
- Ensure all logic is complete without omitting critical implementations.
For general queries:
- Be clear, direct, insightful, and helpful.`;

// POST /api/chat - Stream chat response
chatRouter.post('/chat', async (c) => {
  const userId = c.get('userId') || 'anonymous';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

  if (!openaiKey && !geminiKey) {
    return c.json({ error: 'No LLM API key configured on server (OPENAI_API_KEY or GEMINI_API_KEY required)' }, 500);
  }

  try {
    const body = await c.req.json();
    const { messages, model: requestedModel } = chatRequestSchema.parse(body);

    // Get or create user if authenticated
    let user = null;
    if (userId !== 'anonymous') {
      user = await User.findOne({ supabaseId: userId });
      if (!user) {
        const currentUser = c.get('user') as any;
        user = new User({
          supabaseId: userId,
          email: currentUser?.email || 'unknown@example.com',
        });
        await user.save();
      }

      // Check usage limits for free tier
      if (user.tier === 'free' && user.usageCount >= 50) {
        return c.json({
          error: 'Daily usage limit reached (50 messages/day). Upgrade to Pro for unlimited access.',
        }, 429);
      }
    }

    // Convert messages to Gemini API format (Sliding window of last 20 messages)
    const truncated = messages.slice(-20);
    const geminiContents = truncated.map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const latestUserMessage = truncated[truncated.length - 1]?.content || '';

    // Create or find conversation
    const conversationId = c.req.header('x-conversation-id');
    let conversation = conversationId && userId !== 'anonymous'
      ? await Conversation.findOne({ _id: conversationId, userId })
      : null;

    if (!conversation && userId !== 'anonymous') {
      conversation = new Conversation({
        userId,
        title: latestUserMessage.substring(0, 50) || 'New Chat',
        model: requestedModel || 'gemini-3.5-flash',
        messages: [],
        totalTokens: 0,
      });
    }

    if (conversation) {
      conversation.messages.push({
        role: 'user',
        content: latestUserMessage,
        timestamp: new Date(),
      });
    }

    // If OpenAI key is available, prefer OpenAI streaming path
    if (openaiKey) {
      // Map messages to OpenAI chat format
      const openaiMessages = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      ];

      const openaiModel = requestedModel || 'gpt-4o';
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({ model: openaiModel, messages: openaiMessages, stream: true, temperature: 0.7 }),
      });

      if (!openaiRes.ok || !openaiRes.body) {
        const errText = await openaiRes.text().catch(() => '');
        console.error('[OpenAI] Stream request failed', openaiRes.status, errText.slice(0, 200));
        return c.json({ error: 'OpenAI streaming request failed' }, 502);
      }

      const sourceReader = openaiRes.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await sourceReader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.trim()) continue;
                // OpenAI SSE lines are prefixed with 'data: '
                const dataLine = line.startsWith('data: ') ? line.slice(6).trim() : line.trim();
                if (!dataLine || dataLine === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(dataLine);
                  // delta content for chat completions: parsed.choices[0].delta.content
                  const textDelta = parsed?.choices?.[0]?.delta?.content;
                  if (textDelta) {
                    accumulatedText += textDelta;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'text_delta', text: textDelta, model: openaiModel })}\n\n`)
                    );
                  }
                } catch (e) {
                  // partial JSON, ignore until complete
                }
              }
            }

            // Save assistant message to conversation
            if (conversation && accumulatedText) {
              conversation.messages.push({
                role: 'assistant',
                content: accumulatedText,
                timestamp: new Date(),
              });

              const tokens = Math.ceil((accumulatedText.length + latestUserMessage.length) / 4);
              conversation.totalTokens += tokens;
              await conversation.save().catch((e) => console.error('Error saving conversation:', e));
            }

            // Increment user usage
            if (user) {
              user.usageCount++;
              await user.save().catch((e) => console.error('Error saving user usage:', e));
            }

            // Send message completion event
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'message_stop', finalText: accumulatedText, model: openaiModel })}\n\n`)
            );
            controller.close();
          } catch (streamErr: any) {
            console.error('[OpenAI Stream Error]', streamErr);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: streamErr?.message || 'Streaming interrupted' })}\n\n`)
            );
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Model fallback loop
    const candidates = getModelCandidates(requestedModel);
    let successfulResponse: globalThis.Response | null = null;
    let successfulModel = candidates[0];

    for (const candidate of candidates) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:streamGenerateContent?alt=sse&key=${geminiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
            },
          }),
        });

        if (res.ok && res.body) {
          successfulResponse = res;
          successfulModel = candidate;
          break;
        } else {
          const errText = await res.text();
          console.warn(`[Gemini fallback] Model ${candidate} returned status ${res.status}: ${errText.slice(0, 120)}`);
        }
      } catch (err: any) {
        console.warn(`[Gemini fallback] Connection to ${candidate} failed:`, err.message);
      }
    }

    if (!successfulResponse || !successfulResponse.body) {
      console.error('[Gemini API] All candidate models failed in cascade:', candidates);
      return c.json({ error: 'All Gemini model endpoints failed. Please check API quota or key.' }, 502);
    }

    // Stream SSE Response back to frontend
    const sourceReader = successfulResponse.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await sourceReader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const textDelta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textDelta) {
                    accumulatedText += textDelta;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'text_delta', text: textDelta, model: successfulModel })}\n\n`)
                    );
                  }
                } catch {
                  // Ignore JSON parse errors on partial frames
                }
              }
            }
          }

          // Save assistant message to conversation
          if (conversation && accumulatedText) {
            conversation.messages.push({
              role: 'assistant',
              content: accumulatedText,
              timestamp: new Date(),
            });

            const tokens = Math.ceil((accumulatedText.length + latestUserMessage.length) / 4);
            conversation.totalTokens += tokens;
            await conversation.save().catch((e) => console.error('Error saving conversation:', e));
          }

          // Increment user usage
          if (user) {
            user.usageCount++;
            await user.save().catch((e) => console.error('Error saving user usage:', e));
          }

          // Send message completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'message_stop', finalText: accumulatedText, model: successfulModel })}\n\n`)
          );
          controller.close();
        } catch (streamErr: any) {
          console.error('[Stream Error]', streamErr);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: streamErr?.message || 'Streaming interrupted' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request format', details: error.errors }, 400);
    }
    console.error('[Chat API Error]', error);
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
});

// GET /api/conversations - Get user's conversations
chatRouter.get('/conversations', async (c) => {
  const userId = c.get('userId');
  if (!userId || userId === 'anonymous') return c.json({ error: 'Unauthorized' }, 401);

  try {
    const conversations = await Conversation.find({ userId })
      .select('_id title model createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    return c.json({ conversations });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

// GET /api/conversations/:id - Get specific conversation
chatRouter.get('/conversations/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  if (!userId || userId === 'anonymous') return c.json({ error: 'Unauthorized' }, 401);

  try {
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    return c.json({ conversation });
  } catch (error) {
    console.error('Conversation fetch error:', error);
    return c.json({ error: 'Failed to fetch conversation' }, 500);
  }
});

// DELETE /api/conversations/:id - Delete conversation
chatRouter.delete('/conversations/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  if (!userId || userId === 'anonymous') return c.json({ error: 'Unauthorized' }, 401);

  try {
    const result = await Conversation.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Conversation delete error:', error);
    return c.json({ error: 'Failed to delete conversation' }, 500);
  }
});

export default chatRouter;
