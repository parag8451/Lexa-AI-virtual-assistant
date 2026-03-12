-- =====================================================
-- PHASE 1: CORE INTELLIGENCE FEATURES
-- Custom Instructions, Smart Templates, Learning Profiles
-- =====================================================

-- 1. Custom Instructions Table
-- Users can define persistent rules that apply to all conversations
CREATE TABLE public.custom_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom_instructions
ALTER TABLE public.custom_instructions ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_instructions
CREATE POLICY "Users can view their own custom instructions"
  ON public.custom_instructions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom instructions"
  ON public.custom_instructions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom instructions"
  ON public.custom_instructions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom instructions"
  ON public.custom_instructions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custom_instructions_updated_at
  BEFORE UPDATE ON public.custom_instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Smart Templates Table
-- Reusable prompts with variables
CREATE TABLE public.smart_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT 'Sparkles',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on smart_templates
ALTER TABLE public.smart_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for smart_templates
CREATE POLICY "Users can view their own smart templates"
  ON public.smart_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own smart templates"
  ON public.smart_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart templates"
  ON public.smart_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart templates"
  ON public.smart_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_smart_templates_updated_at
  BEFORE UPDATE ON public.smart_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Learning Profiles Table
-- Stores learned user patterns and preferences
CREATE TABLE public.learning_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  writing_style JSONB DEFAULT '{}'::jsonb,
  topics_of_interest JSONB DEFAULT '[]'::jsonb,
  expertise_levels JSONB DEFAULT '{}'::jsonb,
  communication_preferences JSONB DEFAULT '{}'::jsonb,
  interaction_patterns JSONB DEFAULT '{}'::jsonb,
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_conversations INTEGER NOT NULL DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on learning_profiles
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for learning_profiles
CREATE POLICY "Users can view their own learning profile"
  ON public.learning_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning profile"
  ON public.learning_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning profile"
  ON public.learning_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_learning_profiles_updated_at
  BEFORE UPDATE ON public.learning_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create learning profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_learning_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.learning_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_learning_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_learning_profile();

-- 4. Add preferred_routing_mode to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS auto_model_routing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_complexity TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS custom_instructions_enabled BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_instructions_user_id ON public.custom_instructions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_instructions_active ON public.custom_instructions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_smart_templates_user_id ON public.smart_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_templates_category ON public.smart_templates(user_id, category);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_user_id ON public.learning_profiles(user_id);