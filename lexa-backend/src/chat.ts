import { Hono } from 'hono'

const chat = new Hono()

chat.post('/chat', async (c) => {
  const body = await c.req.json()

  return c.json({
    reply: `Lexa received: ${body.message}`
  })
})

export default chat
