import { Context, Next } from 'hono';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppEnv } from '../types';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Supabase client singleton
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// JWT Middleware - Verify Supabase token
export async function jwtMiddleware(c: Context<AppEnv>, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    c.set('userId', 'anonymous');
    c.set('userTier', 'free');
    return await next();
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Attach user to context
    c.set('user', user);
    c.set('userId', user.id);

    // Fetch user tier from MongoDB for rate limiting
    try {
      const { User } = await import('../models/index');
      const dbUser = await User.findOne({ supabaseId: user.id }).lean();
      c.set('userTier', dbUser?.tier || 'free');
    } catch (err) {
      logger.warn('Could not fetch user tier, defaulting to free', { error: err instanceof Error ? err.message : String(err) });
      c.set('userTier', 'free');
    }

    return await next();
  } catch (err) {
    logger.error('JWT verification error', err);
    return c.json({ error: 'Token verification failed' }, 401);
  }
}

// Redis client singleton with connection pooling
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 10000,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 100, 3000);
      },
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis connection error', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });
  }
  return redisClient;
}

// Rate limit configuration from environment
const RATE_LIMITS = {
  free: { requests: parseInt(process.env.RATE_LIMIT_FREE || '20', 10), window: 60 },
  pro: { requests: parseInt(process.env.RATE_LIMIT_PRO || '100', 10), window: 60 },
  enterprise: { requests: parseInt(process.env.RATE_LIMIT_ENTERPRISE || '1000', 10), window: 60 },
};

export async function rateLimitMiddleware(c: Context<AppEnv>, next: Next): Promise<Response | void> {
  const userId = c.get('userId');
  const ip = c.req.header('x-forwarded-for') || c.req.header('user-agent') || 'anonymous-ip';
  
  // Try to get user tier from context (set by chat route after DB lookup)
  const userTier = c.get('userTier') || 'free';
  const limit = RATE_LIMITS[userTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
  
  const key = `ratelimit:${userId || ip}`;

  try {
    const redis = getRedisClient();
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
    logger.warn('Redis rate limit error, bypassing limit', { error: err instanceof Error ? err.message : String(err) });
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
  logger.error('Unhandled error', err);

  const isValidationError = err.message.includes('validation') || err instanceof SyntaxError;
  const status = isValidationError ? 400 : 500;
  const code = isValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';

  return c.json({
    error: {
      code,
      message: isValidationError ? err.message : 'An unexpected error occurred',
    },
  }, status);
}
