import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Shared Hono environment type used across the app.
 * Defines the custom context variables set by middleware (e.g., jwtMiddleware).
 */
export type AppEnv = {
  Variables: {
    user: SupabaseUser;
    userId: string;
  };
};
