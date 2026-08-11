import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { AppEnv } from '../types';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

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

// Rate Limiting Middleware using Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const RATE_LIMITS = {
  free: { requests: 20, window: 60 }, // 20 requests per minute
  pro: { requests: 100, window: 60 },
  enterprise: { requests: 1000, window: 60 },
};

export async function rateLimitMiddleware(c: Context<AppEnv>, next: Next): Promise<Response | void> {
  const userId = c.get('userId');
  const ip = c.req.header('x-forwarded-for') || c.req.header('user-agent') || 'anonymous-ip';
  
  const key = `ratelimit:${userId || ip}`;
  const limit = RATE_LIMITS.free; // Default to free tier

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, limit.window);
    }

    if (current > limit.requests) {
      const ttl = await redis.ttl(key);
      return c.json(
        { error: 'Rate limit exceeded', retryAfter: ttl > 0 ? ttl : limit.window },
        429
      );
    }

    c.header('X-RateLimit-Limit', String(limit.requests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit.requests - current)));
  } catch (err) {
    logger.error('Redis rate limit error, bypassing limit', err);
  }

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

  logger.info('API Request', {
    method,
    path,
    status,
    durationMs: duration,
    userId: userId || 'anonymous',
  });
  
  logger.metric('api.latency_ms', duration, { method, path, status: String(status) });
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
