import connectDB from "./db";
import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { jwtMiddleware, rateLimitMiddleware, loggingMiddleware } from './middleware/auth'
import chatRouter from './routes/chat'
import contactRouter from './routes/contact'
import type { AppEnv } from './types'
import mongoose from 'mongoose';

// Startup Security Checks
if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY && !process.env.VITE_SUPABASE_PUBLISHABLE_KEY)) {
  console.error('FATAL: Supabase environment variables are missing. Auth will fail.');
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

const app = new Hono<AppEnv>()

// 🔑 CONNECT DATABASE (IMPORTANT)
await connectDB();

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
]

// Middleware stack
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    // Only allow specific localhosts, don't wildcard match
    if (origin === 'http://localhost:8080' || origin === 'http://localhost:5173') {
      return origin;
    }
    return null; // Block unknown origins in production
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

app.use('*', loggingMiddleware)

// Deep Health Check Endpoint (/healthz)
app.get('/healthz', async (c) => {
  const dbState = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting
  const isDbHealthy = dbState === 1;

  const healthData = {
    status: isDbHealthy ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: isDbHealthy ? 'connected' : 'disconnected',
    },
    memoryUsage: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    }
  };

  return c.json(healthData, isDbHealthy ? 200 : 503);
})

// Public endpoint
app.get('/', (c) => c.text('Lexa AI backend running'))

// Public contact route
app.route('/api', contactRouter)

// Apply JWT middleware to authenticated API routes
app.use('/api/*', jwtMiddleware)

// Apply rate limiting to chat endpoint
app.use('/api/chat', rateLimitMiddleware)

// Routes
app.route('/api', chatRouter)

// Global 404 Not Found Handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404)
})

// Global 500 Error Handler
app.onError((err, c) => {
  console.error(`[Server Error] ${err}`)
  return c.json({ error: 'Internal Server Error' }, 500)
})

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Backend running on http://localhost:${port}`)
console.log(`🗄️  Database connected to ${process.env.MONGO_URI?.split('@')[1] || 'MongoDB'}`)
console.log(`🔐 CORS enabled for: ${allowedOrigins.join(', ')}`)

serve({
  fetch: app.fetch,
  port
})
