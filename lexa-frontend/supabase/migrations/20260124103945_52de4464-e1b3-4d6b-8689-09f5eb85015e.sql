-- Create workspace role enum
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_personal BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create conversation shares table
CREATE TABLE public.conversation_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT share_target CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_workspace_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_workspace_id IS NOT NULL)
  )
);

-- Create workspace invites table
CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_shares;

-- Security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id
  )
$$;

-- Security definer function to check workspace role
CREATE OR REPLACE FUNCTION public.get_workspace_role(p_workspace_id UUID, p_user_id UUID)
RETURNS workspace_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id
  LIMIT 1
$$;

-- Security definer function to check conversation access
CREATE OR REPLACE FUNCTION public.can_access_conversation(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User owns the conversation
    SELECT 1 FROM public.conversations WHERE id = p_conversation_id AND user_id = p_user_id
    UNION
    -- User has direct share
    SELECT 1 FROM public.conversation_shares 
    WHERE conversation_id = p_conversation_id 
      AND shared_with_user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > now())
    UNION
    -- User is in a workspace that has access
    SELECT 1 FROM public.conversation_shares cs
    JOIN public.workspace_members wm ON cs.shared_with_workspace_id = wm.workspace_id
    WHERE cs.conversation_id = p_conversation_id 
      AND wm.user_id = p_user_id
      AND (cs.expires_at IS NULL OR cs.expires_at > now())
  )
$$;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(id, auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace owners and admins can update"
ON public.workspaces FOR UPDATE
USING (
  public.get_workspace_role(id, auth.uid()) IN ('owner', 'admin')
);

CREATE POLICY "Only workspace owners can delete"
ON public.workspaces FOR DELETE
USING (created_by = auth.uid());

-- RLS Policies for workspace_members
CREATE POLICY "Members can view other members in their workspaces"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Owners and admins can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  OR (
    -- Allow initial owner to add themselves
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND created_by = auth.uid())
  )
);

CREATE POLICY "Owners and admins can update member roles"
ON public.workspace_members FOR UPDATE
USING (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
);

CREATE POLICY "Owners and admins can remove members"
ON public.workspace_members FOR DELETE
USING (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
  OR user_id = auth.uid() -- Users can leave
);

-- RLS Policies for conversation_shares
CREATE POLICY "Users can view shares for their conversations or shared with them"
ON public.conversation_shares FOR SELECT
USING (
  shared_by = auth.uid() 
  OR shared_with_user_id = auth.uid()
  OR (shared_with_workspace_id IS NOT NULL AND public.is_workspace_member(shared_with_workspace_id, auth.uid()))
);

CREATE POLICY "Conversation owners can create shares"
ON public.conversation_shares FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
);

CREATE POLICY "Conversation owners can update shares"
ON public.conversation_shares FOR UPDATE
USING (shared_by = auth.uid());

CREATE POLICY "Conversation owners can delete shares"
ON public.conversation_shares FOR DELETE
USING (shared_by = auth.uid());

-- RLS Policies for workspace_invites
CREATE POLICY "Workspace admins can view invites"
ON public.workspace_invites FOR SELECT
USING (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
);

CREATE POLICY "Workspace admins can create invites"
ON public.workspace_invites FOR INSERT
WITH CHECK (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
);

CREATE POLICY "Workspace admins can update invites"
ON public.workspace_invites FOR UPDATE
USING (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
);

CREATE POLICY "Workspace admins can delete invites"
ON public.workspace_invites FOR DELETE
USING (
  public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-add creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created
AFTER INSERT ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_workspace();