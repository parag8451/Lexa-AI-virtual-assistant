-- Create rate_limits table for server-side rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_request TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits (no user access)
-- This is intentional - rate limits are managed server-side only

-- Create function to check and update rate limits
-- Returns true if request is allowed, false if rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start
  v_window_start := v_now - (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint
  FOR UPDATE;
  
  IF NOT FOUND THEN
    -- Create new record
    INSERT INTO rate_limits (user_id, endpoint, request_count, window_start, last_request)
    VALUES (p_user_id, p_endpoint, 1, v_now, v_now);
    RETURN TRUE;
  END IF;
  
  -- Check if window has expired
  IF v_record.window_start < v_window_start THEN
    -- Reset window
    UPDATE rate_limits
    SET request_count = 1, window_start = v_now, last_request = v_now
    WHERE id = v_record.id;
    RETURN TRUE;
  END IF;
  
  -- Check if over limit
  IF v_record.request_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE rate_limits
  SET request_count = request_count + 1, last_request = v_now
  WHERE id = v_record.id;
  
  RETURN TRUE;
END;
$$;

-- Create function to get remaining requests
CREATE OR REPLACE FUNCTION public.get_rate_limit_remaining(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE(remaining INTEGER, reset_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMP WITH TIME ZONE := now() - (p_window_seconds || ' seconds')::INTERVAL;
BEGIN
  SELECT * INTO v_record
  FROM rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  IF NOT FOUND OR v_record.window_start < v_window_start THEN
    remaining := p_max_requests;
    reset_at := now() + (p_window_seconds || ' seconds')::INTERVAL;
    RETURN NEXT;
    RETURN;
  END IF;
  
  remaining := GREATEST(0, p_max_requests - v_record.request_count);
  reset_at := v_record.window_start + (p_window_seconds || ' seconds')::INTERVAL;
  RETURN NEXT;
END;
$$;