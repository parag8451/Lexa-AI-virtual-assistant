import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  is_personal: boolean;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_by: string | null;
  joined_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
  expires_at: string;
}

export function useWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myRole, setMyRole] = useState<WorkspaceRole | null>(null);

  // Fetch all workspaces user is a member of
  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching workspaces:", error);
    } else {
      setWorkspaces((data as unknown as Workspace[]) || []);
      
      // Auto-select first workspace if none selected
      if (!currentWorkspace && data && data.length > 0) {
        setCurrentWorkspace(data[0] as unknown as Workspace);
      }
    }
    setIsLoading(false);
  }, [user, currentWorkspace]);

  // Fetch members of current workspace
  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace) return;

    const { data, error } = await supabase
      .from("workspace_members")
      .select(`
        *,
        profile:profiles!workspace_members_user_id_fkey(display_name, avatar_url)
      `)
      .eq("workspace_id", currentWorkspace.id);

    if (error) {
      console.error("Error fetching members:", error);
      // Fallback without join
      const { data: fallbackData } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", currentWorkspace.id);
      setMembers((fallbackData as unknown as WorkspaceMember[]) || []);
    } else {
      setMembers((data as unknown as WorkspaceMember[]) || []);
    }

    // Get current user's role
    if (user) {
      const myMember = (data as unknown as WorkspaceMember[] || []).find(m => m.user_id === user.id);
      setMyRole(myMember?.role || null);
    }
  }, [currentWorkspace, user]);

  // Fetch pending invites
  const fetchInvites = useCallback(async () => {
    if (!currentWorkspace || !myRole || !["owner", "admin"].includes(myRole)) return;

    const { data, error } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("workspace_id", currentWorkspace.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching invites:", error);
    } else {
      setInvites((data as unknown as WorkspaceInvite[]) || []);
    }
  }, [currentWorkspace, myRole]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    fetchMembers();
    fetchInvites();
  }, [fetchMembers, fetchInvites]);

  // Create a new workspace
  const createWorkspace = useCallback(async (name: string, description?: string): Promise<Workspace | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        name,
        description: description || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Create workspace error:", error);
      toast.error("Failed to create workspace");
      return null;
    }

    const workspace = data as unknown as Workspace;
    setWorkspaces(prev => [workspace, ...prev]);
    setCurrentWorkspace(workspace);
    toast.success(`Workspace "${name}" created!`);
    return workspace;
  }, [user]);

  // Update workspace
  const updateWorkspace = useCallback(async (
    workspaceId: string,
    updates: { name?: string; description?: string | null; avatar_url?: string | null }
  ) => {
    const { error } = await supabase
      .from("workspaces")
      .update(updates)
      .eq("id", workspaceId);

    if (error) {
      console.error("Update workspace error:", error);
      toast.error("Failed to update workspace");
      return false;
    }

    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, ...updates } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates } : null);
    }
    toast.success("Workspace updated");
    return true;
  }, [currentWorkspace]);

  // Delete workspace
  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (error) {
      console.error("Delete workspace error:", error);
      toast.error("Failed to delete workspace");
      return false;
    }

    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(workspaces.find(w => w.id !== workspaceId) || null);
    }
    toast.success("Workspace deleted");
    return true;
  }, [currentWorkspace, workspaces]);

  // Invite member by email
  const inviteMember = useCallback(async (email: string, role: WorkspaceRole = "member") => {
    if (!currentWorkspace || !user) return null;

    const { data, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: currentWorkspace.id,
        email,
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Invite error:", error);
      toast.error("Failed to send invite");
      return null;
    }

    const invite = data as unknown as WorkspaceInvite;
    setInvites(prev => [invite, ...prev]);
    toast.success(`Invite sent to ${email}`);
    return invite;
  }, [currentWorkspace, user]);

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, newRole: WorkspaceRole) => {
    const { error } = await supabase
      .from("workspace_members")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      console.error("Update role error:", error);
      toast.error("Failed to update role");
      return false;
    }

    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
    toast.success("Role updated");
    return true;
  }, []);

  // Remove member
  const removeMember = useCallback(async (memberId: string) => {
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove member");
      return false;
    }

    setMembers(prev => prev.filter(m => m.id !== memberId));
    toast.success("Member removed");
    return true;
  }, []);

  // Leave workspace
  const leaveWorkspace = useCallback(async () => {
    if (!currentWorkspace || !user) return false;

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", currentWorkspace.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Leave error:", error);
      toast.error("Failed to leave workspace");
      return false;
    }

    setWorkspaces(prev => prev.filter(w => w.id !== currentWorkspace.id));
    setCurrentWorkspace(workspaces.find(w => w.id !== currentWorkspace.id) || null);
    toast.success("Left workspace");
    return true;
  }, [currentWorkspace, user, workspaces]);

  // Cancel invite
  const cancelInvite = useCallback(async (inviteId: string) => {
    const { error } = await supabase
      .from("workspace_invites")
      .delete()
      .eq("id", inviteId);

    if (error) {
      console.error("Cancel invite error:", error);
      toast.error("Failed to cancel invite");
      return false;
    }

    setInvites(prev => prev.filter(i => i.id !== inviteId));
    toast.success("Invite cancelled");
    return true;
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentWorkspace) return;

    const channel = supabase
      .channel(`workspace-${currentWorkspace.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_members",
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace, fetchMembers]);

  return {
    workspaces,
    currentWorkspace,
    members,
    invites,
    myRole,
    isLoading,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    cancelInvite,
    refreshWorkspaces: fetchWorkspaces,
    refreshMembers: fetchMembers,
  };
}
