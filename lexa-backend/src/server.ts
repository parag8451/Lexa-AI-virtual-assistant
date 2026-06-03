import connectDB from "./db";
import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { jwtMiddleware, rateLimitMiddleware, loggingMiddleware } from './middleware/auth'
import chatRouter from './routes/chat'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// 🔑 CONNECT DATABASE (IMPORTANT)
await connectDB();

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080', 'http://localhost:8082']

// Middleware stack
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

app.use('*', loggingMiddleware)

// Health check endpoint (no auth required)
app.get('/health', (c) => c.json({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}))

// Public endpoint
app.get('/', (c) => c.text('Lexa AI backend running'))

// Apply JWT middleware to API routes
app.use('/api/*', jwtMiddleware)

// Apply rate limiting to chat endpoint
app.use('/api/chat', rateLimitMiddleware)

// Routes
app.route('/api', chatRouter)

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Backend running on http://localhost:${port}`)
console.log(`🗄️  Database connected to ${process.env.MONGO_URI?.split('@')[1] || 'MongoDB'}`)
console.log(`🔐 CORS enabled for: ${allowedOrigins.join(', ')}`)

serve({
  fetch: app.fetch,
  port
})
