-- Secure the rate_limits table by denying all direct user INSERT/UPDATE/DELETE
-- Rate limits should ONLY be managed by the SECURITY DEFINER function check_rate_limit()

-- Create a deny-all INSERT policy (no user can directly insert)
CREATE POLICY "Deny direct rate limit inserts"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Create a deny-all UPDATE policy (no user can directly update)
CREATE POLICY "Deny direct rate limit updates"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (false);

-- Create a deny-all DELETE policy (no user can directly delete)
CREATE POLICY "Deny direct rate limit deletes"
ON public.rate_limits
FOR DELETE
TO authenticated
USING (false);