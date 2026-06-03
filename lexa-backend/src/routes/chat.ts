import { Hono } from 'hono';
import { Conversation, User } from '../models/index';
import { z } from 'zod';
import type { AppEnv } from '../types';

const chatRouter = new Hono<AppEnv>();

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  model: z.string().optional().default('lexa-balanced'),
});

// POST /api/chat - Stream chat response
chatRouter.post('/chat', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // Validate input
    const body = await c.req.json();
    const { messages, model } = chatRequestSchema.parse(body);

    // Get or create user
    let user = await User.findOne({ supabaseId: userId });
    if (!user) {
      const currentUser = c.get('user') as any;
      user = new User({
        supabaseId: userId,
        email: currentUser?.email || 'unknown@example.com',
      });
      await user.save();
    }

    // Check usage limits for free tier
    if (user.tier === 'free' && user.usageCount >= 20) {
      return c.json({
        error: 'Daily usage limit reached (20 messages/day). Upgrade to Pro for unlimited access.',
      }, 429);
    }

    // Create or get conversation from headers
    const conversationId = c.req.header('x-conversation-id');
    let conversation = conversationId
      ? await Conversation.findById(conversationId)
      : null;

    if (!conversation) {
      conversation = new Conversation({
        userId,
        title: messages[0]?.content?.substring(0, 50) || 'New Chat',
        model,
        messages: [],
        totalTokens: 0,
      });
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: messages[messages.length - 1].content,
      timestamp: new Date(),
    });

    // Call Supabase Edge Function to stream chat response
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return c.json({ error: 'Missing token' }, 401);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages,
          model,
          userId,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      return c.json(
        { error: (errorBody as any).error || 'Failed to get response' },
        response.status as 400 | 401 | 403 | 404 | 500
      );
    }

    // Get the readable stream
    const stream = response.body;
    if (!stream) {
      return c.json({ error: 'No response stream' }, 500);
    }

    // Stream response back to client
    let fullResponse = '';

    const streamingResponse = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'text_delta') {
                    fullResponse += data.text;
                    controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'token', text: data.text }) + '\n'));
                  } else if (data.type === 'message_stop') {
                    controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'done', finalText: fullResponse }) + '\n'));
                  } else if (data.type === 'error') {
                    controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'error', error: data.error }) + '\n'));
                  }
                } catch {
                  // Ignore JSON parse errors
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Save conversation after streaming completes
        conversation.messages.push({
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        });

        // Estimate tokens (rough approximation: 4 chars ≈ 1 token)
        const estimatedTokens = Math.ceil((fullResponse.length + messages[messages.length - 1].content.length) / 4);
        conversation.totalTokens += estimatedTokens;
        await conversation.save();

        // Update user usage
        user.usageCount++;
        if (user.usageCount >= 20) {
          user.usageResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
        await user.save();

        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: 'meta', conversationId: conversation._id }) + '\n'));
        controller.close();
      }
    });

    return new Response(streamingResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request format', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
});

// GET /api/conversations - Get user's conversations
chatRouter.get('/conversations', async (c) => {
  const userId = c.get('userId') as string | undefined;
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

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
  const userId = c.get('userId') as string | undefined;
  const id = c.req.param('id');

  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

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
  const userId = c.get('userId') as string | undefined;
  const id = c.req.param('id');

  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

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

// GET /api/health - Health check
chatRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

export default chatRouter;
