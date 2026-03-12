-- Create analytics events table for tracking user actions
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  model_used TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage statistics table for aggregated metrics
CREATE TABLE public.usage_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  total_messages INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  average_response_time_ms INTEGER,
  models_used JSONB DEFAULT '{}'::jsonb,
  topics_discussed JSONB DEFAULT '[]'::jsonb,
  peak_usage_hour INTEGER,
  sentiment_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start, period_type)
);

-- Create productivity scores table
CREATE TABLE public.productivity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  efficiency_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  goal_completion_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_scores ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_analytics_events_user_date ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_usage_statistics_user_period ON public.usage_statistics(user_id, period_start DESC);
CREATE INDEX idx_productivity_scores_user_date ON public.productivity_scores(user_id, score_date DESC);

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for usage_statistics
CREATE POLICY "Users can view their own usage statistics"
ON public.usage_statistics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage statistics"
ON public.usage_statistics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage statistics"
ON public.usage_statistics FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for productivity_scores
CREATE POLICY "Users can view their own productivity scores"
ON public.productivity_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity scores"
ON public.productivity_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity scores"
ON public.productivity_scores FOR UPDATE
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_usage_statistics_updated_at
BEFORE UPDATE ON public.usage_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log analytics events
CREATE OR REPLACE FUNCTION public.log_analytics_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_conversation_id UUID DEFAULT NULL,
  p_model_used TEXT DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT NULL,
  p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    user_id, event_type, event_data, conversation_id, 
    model_used, tokens_used, response_time_ms
  )
  VALUES (
    p_user_id, p_event_type, p_event_data, p_conversation_id,
    p_model_used, p_tokens_used, p_response_time_ms
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION public.get_user_analytics_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_messages BIGINT,
  total_conversations BIGINT,
  avg_messages_per_day NUMERIC,
  most_used_model TEXT,
  total_tokens_used BIGINT,
  avg_response_time NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH message_stats AS (
    SELECT 
      COUNT(*) as msg_count,
      COUNT(DISTINCT conversation_id) as conv_count
    FROM public.messages m
    JOIN public.conversations c ON m.conversation_id = c.id
    WHERE c.user_id = p_user_id
    AND m.created_at > now() - (p_days || ' days')::interval
  ),
  event_stats AS (
    SELECT 
      SUM(tokens_used) as total_tokens,
      AVG(response_time_ms)::NUMERIC as avg_response,
      MODE() WITHIN GROUP (ORDER BY model_used) as top_model
    FROM public.analytics_events
    WHERE user_id = p_user_id
    AND created_at > now() - (p_days || ' days')::interval
    AND event_type = 'message_sent'
  )
  SELECT 
    ms.msg_count as total_messages,
    ms.conv_count as total_conversations,
    ROUND(ms.msg_count::NUMERIC / GREATEST(p_days, 1), 2) as avg_messages_per_day,
    es.top_model as most_used_model,
    COALESCE(es.total_tokens, 0) as total_tokens_used,
    ROUND(COALESCE(es.avg_response, 0), 2) as avg_response_time
  FROM message_stats ms, event_stats es;
$$;