-- Drop existing SELECT policy that may be too permissive
DROP POLICY IF EXISTS "Workspace admins can view invites" ON public.workspace_invites;

-- Create a more secure SELECT policy that strictly validates workspace membership
CREATE POLICY "Workspace admins can view invites for their workspaces"
ON public.workspace_invites
FOR SELECT
USING (
  -- User must be an admin or owner of this specific workspace
  -- AND must be a verified member of the workspace
  get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  AND is_workspace_member(workspace_id, auth.uid())
);

-- Also strengthen INSERT policy to double-check membership
DROP POLICY IF EXISTS "Workspace admins can create invites" ON public.workspace_invites;

CREATE POLICY "Workspace admins can create invites for their workspaces"
ON public.workspace_invites
FOR INSERT
WITH CHECK (
  get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  AND is_workspace_member(workspace_id, auth.uid())
  AND invited_by = auth.uid()
);

-- Strengthen UPDATE policy
DROP POLICY IF EXISTS "Workspace admins can update invites" ON public.workspace_invites;

CREATE POLICY "Workspace admins can update invites for their workspaces"
ON public.workspace_invites
FOR UPDATE
USING (
  get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  AND is_workspace_member(workspace_id, auth.uid())
);

-- Strengthen DELETE policy
DROP POLICY IF EXISTS "Workspace admins can delete invites" ON public.workspace_invites;

CREATE POLICY "Workspace admins can delete invites for their workspaces"
ON public.workspace_invites
FOR DELETE
USING (
  get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  AND is_workspace_member(workspace_id, auth.uid())
);