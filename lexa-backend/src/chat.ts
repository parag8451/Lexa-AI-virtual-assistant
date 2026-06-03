import { Hono } from 'hono'
import { z } from 'zod'

const chat = new Hono()

// Input validation schema
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long')
})

chat.post('/chat', async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate input
    const validated = chatMessageSchema.parse(body)
    
    return c.json({
      reply: `Lexa received: ${validated.message}`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Invalid input',
        details: error.errors
      }, 400)
    }
    return c.json({
      error: 'Internal server error'
    }, 500)
  }
})

export default chat
