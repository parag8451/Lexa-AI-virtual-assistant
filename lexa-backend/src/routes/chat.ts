import { Hono } from 'hono';
import { Conversation, User } from '../models/index';
import { z } from 'zod';
import type { AppEnv } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const chatRouter = new Hono<AppEnv>();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'model']),
    content: z.string().max(10000, "Message too long"),
  })).max(100, "Too many messages"),
  model: z.string().optional().default('gemini-1.5-flash'),
}).strict(); // strict rejects unexpected fields

// POST /api/chat - Stream chat response
chatRouter.post('/chat', async (c) => {
  const userId = c.get('userId') || 'anonymous';
  
  try {
    // Validate input
    const body = await c.req.json();
    const { messages, model } = chatRequestSchema.parse(body);

    if (messages.length === 0) {
      return c.json({ error: 'Messages array cannot be empty' }, 400);
    }

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
      if (user.tier === 'free' && user.usageCount >= 20) {
        return c.json({
          error: 'Daily usage limit reached (20 messages/day). Upgrade to Pro for unlimited access.',
        }, 429);
      }
    }

    // Truncate messages to last 20 to prevent token overflow (Sliding Window)
    const truncatedMessages = messages.slice(-20);
    
    // The latest message is the user prompt
    const latestMessage = truncatedMessages.pop();
    if (!latestMessage || latestMessage.role !== 'user') {
      return c.json({ error: 'Last message must be from user' }, 400);
    }

    // Convert previous messages to Gemini format
    const history = truncatedMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Create or get conversation from headers
    const conversationId = c.req.header('x-conversation-id');
    let conversation = conversationId && userId !== 'anonymous'
      ? await Conversation.findOne({ _id: conversationId, userId })
      : null;

    if (!conversation && userId !== 'anonymous') {
      conversation = new Conversation({
        userId,
        title: latestMessage.content.substring(0, 50) || 'New Chat',
        model,
        messages: [],
        totalTokens: 0,
      });
    }

    if (conversation) {
      conversation.messages.push({
        role: 'user',
        content: latestMessage.content,
        timestamp: new Date(),
      });
    }

    const generativeModel = genAI.getGenerativeModel({ model });
    const chat = generativeModel.startChat({ history });

    try {
      const result = await chat.sendMessageStream([{ text: latestMessage.content }]);

      let fullResponse = '';

      const streamingResponse = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullResponse += chunkText;
              
              // Stream SSE format
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text_delta', text: chunkText })}\n\n`));
            }
            
            // Save conversation after streaming completes
            if (conversation) {
              conversation.messages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date(),
              });

              const estimatedTokens = Math.ceil((fullResponse.length + latestMessage.content.length) / 4);
              conversation.totalTokens += estimatedTokens;
              await conversation.save();
            }

            // Update user usage
            if (user) {
              user.usageCount++;
              if (user.usageCount >= 20) {
                user.usageResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
              }
              await user.save();
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'message_stop', finalText: fullResponse })}\n\n`));
            controller.close();
          } catch (streamError: any) {
            console.error('Streaming error:', streamError);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: streamError?.message || 'Stream interrupted' })}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(streamingResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });

    } catch (geminiError: any) {
      console.error('Gemini API error:', geminiError);
      const status = geminiError.status || 500;
      
      if (geminiError.message?.includes('429')) {
        return c.json({ error: 'Gemini API Rate Limit Exceeded' }, 429);
      }
      if (geminiError.message?.includes('SAFETY')) {
        return c.json({ error: 'Response blocked by safety filters' }, 403);
      }
      return c.json({ error: 'Error connecting to Gemini API' }, status);
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request format', details: error.errors }, 400);
    }
    console.error('Chat error:', error);
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
