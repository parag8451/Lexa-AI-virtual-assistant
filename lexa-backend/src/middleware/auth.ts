import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { AppEnv } from '../types';

// JWT Middleware - Verify Supabase token
export async function jwtMiddleware(c: Context<AppEnv>, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    c.set('userId', 'anonymous');
    return await next();
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not configured');
    return c.json({ error: 'Server configuration error' }, 500);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Attach user to context
    c.set('user', user);
    c.set('userId', user.id);

    return await next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return c.json({ error: 'Token verification failed' }, 401);
  }
}

// Rate Limiting Middleware
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS = {
  free: { requests: 20, window: 60 }, // 20 requests per minute
  pro: { requests: 100, window: 60 },
  enterprise: { requests: 1000, window: 60 },
};

export async function rateLimitMiddleware(c: Context<AppEnv>, next: Next): Promise<Response | void> {
  const userId = c.get('userId');
  const ip = c.req.header('x-forwarded-for') || c.req.header('user-agent') || 'anonymous-ip';
  
  const now = Date.now();
  const key = `ratelimit:${userId || ip}`;
  const limit = RATE_LIMITS.free; // Default to free tier

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + limit.window * 1000 };
  }

  if (record.count >= limit.requests) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000);
    return c.json(
      { error: 'Rate limit exceeded', retryAfter: resetIn },
      429
    );
  }

  record.count++;
  rateLimitStore.set(key, record);

  // Add rate limit headers
  c.header('X-RateLimit-Limit', String(limit.requests));
  c.header('X-RateLimit-Remaining', String(limit.requests - record.count));
  c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

  return await next();
}

// Logging Middleware
export async function loggingMiddleware(c: Context<AppEnv>, next: Next) {
  const startTime = Date.now();
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;
  const userId = c.get('userId');

  await next();

  const duration = Date.now() - startTime;
  const status = c.res.status;

  // Structured logging
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    duration: `${duration}ms`,
    userId: userId || 'anonymous',
  }));
}

// Error Handler Middleware
export function errorHandler(err: Error, c: Context<AppEnv>) {
  console.error('Error:', err);

  const isValidationError = err.message.includes('validation');
  const status = isValidationError ? 400 : 500;
  const code = isValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';

  return c.json({
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
    },
  }, status);
}
