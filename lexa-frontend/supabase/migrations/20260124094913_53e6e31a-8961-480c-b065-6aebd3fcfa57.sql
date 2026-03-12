-- Add RLS policies for rate_limits table
-- Note: The check_rate_limit and get_rate_limit_remaining functions are SECURITY DEFINER,
-- so they bypass RLS. These policies are for direct table access.

-- Allow users to view their own rate limit records
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Users should NOT be able to insert/update/delete rate limits directly
-- Rate limits are managed by SECURITY DEFINER functions called from edge functions
-- No INSERT/UPDATE/DELETE policies needed for regular users

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint 
ON public.rate_limits(user_id, endpoint);