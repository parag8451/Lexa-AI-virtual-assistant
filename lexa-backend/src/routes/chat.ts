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

// Request validation schema with multimodal attachments
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'model']),
    content: z.string().max(50000, "Message too long"),
  })).min(1, "Messages array cannot be empty").max(100, "Too many messages"),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    data: z.string(), // raw base64 data
    textContent: z.string().optional(),
  })).optional(),
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

// System instruction to ensure intelligent formatting, code syntax, vision understanding, and reasoning
const SYSTEM_INSTRUCTION = `You are Lexa AI, an advanced, multimodal intelligent virtual AI assistant.
You possess high capabilities in reading documents, PDFs, code files, analyzing photographs, scanned documents, OCR transcription, math/diagram solving, and general knowledge.
When analyzing images, scans, or documents:
- Provide accurate, structured, and insightful observations.
- If performing OCR, transcribe text cleanly with correct formatting.
- If solving problems from photos, provide clear step-by-step logic.
When asked to write code:
- Provide clean, production-ready, well-commented code with correct language tags (e.g. \`\`\`python, \`\`\`javascript, \`\`\`html, \`\`\`tsx).
- Explain key architectural decisions concisely.
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
    const { messages, attachments = [], model: requestedModel } = chatRequestSchema.parse(body);

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
      if (user.tier === 'free' && user.usageCount >= 100) {
        return c.json({
          error: 'Daily usage limit reached. Upgrade to Pro for unlimited access.',
        }, 429);
      }
    }

    const latestUserMessageObj = messages[messages.length - 1];
    let latestUserText = latestUserMessageObj?.content || '';

    // Append text documents if present
    if (attachments.length > 0) {
      const textDocs = attachments.filter((att) => att.textContent);
      if (textDocs.length > 0) {
        const docsContext = textDocs
          .map((doc) => `\n\n[Attached File: ${doc.name}]\n\`\`\`\n${doc.textContent}\n\`\`\``)
          .join('\n');
        latestUserText = `${latestUserText}\n${docsContext}`;
      }
    }

    // Create or find conversation
    const conversationId = c.req.header('x-conversation-id');
    let conversation = conversationId && userId !== 'anonymous'
      ? await Conversation.findOne({ _id: conversationId, userId })
      : null;

    if (!conversation && userId !== 'anonymous') {
      conversation = new Conversation({
        userId,
        title: latestUserText.substring(0, 50) || 'New Chat',
        model: requestedModel || 'gemini-3.5-flash',
        messages: [],
        totalTokens: 0,
      });
    }

    if (conversation) {
      conversation.messages.push({
        role: 'user',
        content: latestUserText,
        timestamp: new Date(),
      });
    }

    // Build Gemini multimodal contents
    const truncated = messages.slice(-15);
    const geminiContents = truncated.map((m, idx) => {
      const isLatest = idx === truncated.length - 1;
      const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';

      if (isLatest && role === 'user') {
        const parts: any[] = [{ text: latestUserText }];
        // Add image/pdf inlineData
        for (const att of attachments) {
          if (att.data && (att.type.startsWith('image/') || att.type === 'application/pdf')) {
            parts.push({
              inlineData: {
                mimeType: att.type,
                data: att.data,
              },
            });
          }
        }
        return { role, parts };
      }

      return {
        role,
        parts: [{ text: m.content }],
      };
    });

    // If model explicitly requests GPT / Claude or OpenAI key is present with gpt model selection
    const isExplicitOpenAI = requestedModel?.toLowerCase().includes('gpt') || requestedModel?.toLowerCase().includes('o1');

    if (openaiKey && isExplicitOpenAI) {
      const openaiModel = requestedModel || 'gpt-4o';
      const openaiMessages: any[] = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
      ];

      messages.forEach((m, idx) => {
        const isLatest = idx === messages.length - 1;
        if (isLatest && m.role === 'user') {
          const contentParts: any[] = [{ type: 'text', text: latestUserText }];
          for (const att of attachments) {
            if (att.data && att.type.startsWith('image/')) {
              contentParts.push({
                type: 'image_url',
                image_url: {
                  url: `data:${att.type};base64,${att.data}`,
                },
              });
            }
          }
          openaiMessages.push({ role: 'user', content: contentParts });
        } else {
          openaiMessages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          });
        }
      });

      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({ model: openaiModel, messages: openaiMessages, stream: true, temperature: 0.7 }),
      });

      if (openaiRes.ok && openaiRes.body) {
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
                  const dataLine = line.startsWith('data: ') ? line.slice(6).trim() : line.trim();
                  if (!dataLine || dataLine === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(dataLine);
                    const textDelta = parsed?.choices?.[0]?.delta?.content;
                    if (textDelta) {
                      accumulatedText += textDelta;
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'text_delta', text: textDelta, model: openaiModel })}\n\n`)
                      );
                    }
                  } catch (e) {}
                }
              }

              if (conversation && accumulatedText) {
                conversation.messages.push({
                  role: 'assistant',
                  content: accumulatedText,
                  timestamp: new Date(),
                });
                await conversation.save().catch(() => {});
              }

              if (user) {
                user.usageCount++;
                await user.save().catch(() => {});
              }

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'message_stop', finalText: accumulatedText, model: openaiModel })}\n\n`)
              );
              controller.close();
            } catch (streamErr: any) {
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
    }

    // Gemini API Cascade
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
          console.warn(`[Gemini cascade] Model ${candidate} returned ${res.status}: ${errText.slice(0, 100)}`);
        }
      } catch (err: any) {
        console.warn(`[Gemini cascade] Connection to ${candidate} failed:`, err.message);
      }
    }

    if (!successfulResponse || !successfulResponse.body) {
      return c.json({ error: 'LLM model endpoints unavailable. Please verify API key.' }, 502);
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
                } catch {}
              }
            }
          }

          if (conversation && accumulatedText) {
            conversation.messages.push({
              role: 'assistant',
              content: accumulatedText,
              timestamp: new Date(),
            });
            await conversation.save().catch(() => {});
          }

          if (user) {
            user.usageCount++;
            await user.save().catch(() => {});
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'message_stop', finalText: accumulatedText, model: successfulModel })}\n\n`)
          );
          controller.close();
        } catch (streamErr: any) {
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

// GET /api/conversations
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
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

// GET /api/conversations/:id
chatRouter.get('/conversations/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  if (!userId || userId === 'anonymous') return c.json({ error: 'Unauthorized' }, 401);

  try {
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) return c.json({ error: 'Conversation not found' }, 404);
    return c.json({ conversation });
  } catch (error) {
    return c.json({ error: 'Failed to fetch conversation' }, 500);
  }
});

// DELETE /api/conversations/:id
chatRouter.delete('/conversations/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  if (!userId || userId === 'anonymous') return c.json({ error: 'Unauthorized' }, 401);

  try {
    const result = await Conversation.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) return c.json({ error: 'Conversation not found' }, 404);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete conversation' }, 500);
  }
});

export default chatRouter;
