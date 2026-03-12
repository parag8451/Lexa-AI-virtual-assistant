-- User preferences table for personality, voice settings, and more
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  personality TEXT NOT NULL DEFAULT 'friendly',
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  voice_id TEXT DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  preferred_search_model TEXT DEFAULT 'gemini-2.0-flash',
  search_cooldown_seconds INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User memories table for long-term context
CREATE TABLE public.user_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'preference',
  content TEXT NOT NULL,
  importance INTEGER NOT NULL DEFAULT 5,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster memory lookups
CREATE INDEX idx_user_memories_user_id ON public.user_memories(user_id);
CREATE INDEX idx_user_memories_type ON public.user_memories(memory_type);
CREATE INDEX idx_user_memories_importance ON public.user_memories(importance DESC);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for user_memories
CREATE POLICY "Users can view their own memories"
ON public.user_memories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
ON public.user_memories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
ON public.user_memories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
ON public.user_memories FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_memories_updated_at
BEFORE UPDATE ON public.user_memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create preferences when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_preferences
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_preferences();