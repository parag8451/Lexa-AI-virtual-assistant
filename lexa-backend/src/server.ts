import connectDB from "./db";
import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import chat from './chat'

const app = new Hono()

// 🔑 CONNECT DATABASE (IMPORTANT)
connectDB();

app.use('*', cors())

app.get('/', (c) => c.text('Lexa backend running'))

app.route('/api', chat)

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Backend running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
