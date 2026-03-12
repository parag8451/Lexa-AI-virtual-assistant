-- Fix rate_limits table security - make it system-only (no user INSERT/UPDATE/DELETE)
-- The check_rate_limit function already uses SECURITY DEFINER to manage records

-- Add explicit comment explaining rate_limits is system-managed
COMMENT ON TABLE public.rate_limits IS 'System-managed rate limiting table. Users can only SELECT their own records. All modifications happen via SECURITY DEFINER functions (check_rate_limit, get_rate_limit_remaining).';

-- Fix conversation_shares to automatically exclude expired shares
DROP POLICY IF EXISTS "Users can view shares for their conversations or shared with th" ON public.conversation_shares;

CREATE POLICY "Users can view active shares for their conversations"
ON public.conversation_shares
FOR SELECT
USING (
  (
    shared_by = auth.uid() 
    OR shared_with_user_id = auth.uid() 
    OR (shared_with_workspace_id IS NOT NULL AND is_workspace_member(shared_with_workspace_id, auth.uid()))
  )
  AND (expires_at IS NULL OR expires_at > now())
);

-- Add policy for messages to allow viewing shared conversation messages
CREATE POLICY "Users can view messages in shared conversations"
ON public.messages
FOR SELECT
USING (
  can_access_conversation(conversation_id, auth.uid())
);

-- Remove UPDATE/DELETE from analytics_events (make it append-only for integrity)
DROP POLICY IF EXISTS "Users can update their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can delete their own analytics events" ON public.analytics_events;

-- Remove UPDATE/DELETE from usage_statistics (protect billing data)
DROP POLICY IF EXISTS "Users can update their own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can delete their own usage statistics" ON public.usage_statistics;

-- Remove UPDATE/DELETE from productivity_scores (protect gamification integrity)
DROP POLICY IF EXISTS "Users can update their own productivity scores" ON public.productivity_scores;
DROP POLICY IF EXISTS "Users can delete their own productivity scores" ON public.productivity_scores;