-- Fix security vulnerabilities: Add missing RLS policies

-- 1. Rate limits - Critical: Prevent users from manipulating rate limit counters
-- These should only be modifiable by the server (SECURITY DEFINER functions)
-- No direct INSERT/UPDATE policies for users - handled by check_rate_limit function

-- 2. Analytics events - Add UPDATE and DELETE policies for data ownership
CREATE POLICY "Users can update their own analytics events"
ON public.analytics_events
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics events"
ON public.analytics_events
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Image generations - Add UPDATE policy
CREATE POLICY "Users can update their own image generations"
ON public.image_generations
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Learning profiles - Add DELETE policy for GDPR compliance
CREATE POLICY "Users can delete their own learning profile"
ON public.learning_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 5. User preferences - Add DELETE policy
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Productivity scores - Add DELETE policy
CREATE POLICY "Users can delete their own productivity scores"
ON public.productivity_scores
FOR DELETE
USING (auth.uid() = user_id);

-- 7. Usage statistics - Add DELETE policy
CREATE POLICY "Users can delete their own usage statistics"
ON public.usage_statistics
FOR DELETE
USING (auth.uid() = user_id);

-- 8. Profiles - Add DELETE policy for account deletion
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 9. Messages - Add UPDATE policy for message editing
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM conversations
  WHERE conversations.id = messages.conversation_id
  AND conversations.user_id = auth.uid()
));