import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

export type SharePermission = "view" | "comment" | "edit";

export interface ConversationShare {
  id: string;
  conversation_id: string;
  shared_by: string;
  shared_with_user_id: string | null;
  shared_with_workspace_id: string | null;
  permission: SharePermission;
  created_at: string;
  expires_at: string | null;
}

export interface ActiveUser {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  online_at: string;
  cursor_position?: { x: number; y: number };
  current_action?: string;
}

export interface TypingIndicator {
  user_id: string;
  display_name: string | null;
  is_typing: boolean;
}

export function useCollaboration(conversationId?: string) {
  const { user } = useAuth();
  const [shares, setShares] = useState<ConversationShare[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  // Fetch shares for a conversation
  const fetchShares = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("conversation_shares")
      .select("*")
      .eq("conversation_id", conversationId);

    if (error) {
      console.error("Error fetching shares:", error);
    } else {
      setShares((data as unknown as ConversationShare[]) || []);
    }
    setIsLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  // Share conversation with a user
  const shareWithUser = useCallback(async (
    targetConversationId: string,
    targetUserId: string,
    permission: SharePermission = "view",
    expiresAt?: Date
  ): Promise<ConversationShare | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversation_shares")
      .insert({
        conversation_id: targetConversationId,
        shared_by: user.id,
        shared_with_user_id: targetUserId,
        permission,
        expires_at: expiresAt?.toISOString() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Share error:", error);
      toast.error("Failed to share conversation");
      return null;
    }

    const share = data as unknown as ConversationShare;
    setShares(prev => [...prev, share]);
    toast.success("Conversation shared!");
    return share;
  }, [user]);

  // Share conversation with a workspace
  const shareWithWorkspace = useCallback(async (
    targetConversationId: string,
    workspaceId: string,
    permission: SharePermission = "view",
    expiresAt?: Date
  ): Promise<ConversationShare | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversation_shares")
      .insert({
        conversation_id: targetConversationId,
        shared_by: user.id,
        shared_with_workspace_id: workspaceId,
        permission,
        expires_at: expiresAt?.toISOString() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Share error:", error);
      toast.error("Failed to share with workspace");
      return null;
    }

    const share = data as unknown as ConversationShare;
    setShares(prev => [...prev, share]);
    toast.success("Shared with workspace!");
    return share;
  }, [user]);

  // Update share permission
  const updateSharePermission = useCallback(async (shareId: string, permission: SharePermission) => {
    const { error } = await supabase
      .from("conversation_shares")
      .update({ permission })
      .eq("id", shareId);

    if (error) {
      console.error("Update share error:", error);
      toast.error("Failed to update permission");
      return false;
    }

    setShares(prev => prev.map(s => 
      s.id === shareId ? { ...s, permission } : s
    ));
    toast.success("Permission updated");
    return true;
  }, []);

  // Remove share
  const removeShare = useCallback(async (shareId: string) => {
    const { error } = await supabase
      .from("conversation_shares")
      .delete()
      .eq("id", shareId);

    if (error) {
      console.error("Remove share error:", error);
      toast.error("Failed to remove share");
      return false;
    }

    setShares(prev => prev.filter(s => s.id !== shareId));
    toast.success("Share removed");
    return true;
  }, []);

  // Join presence channel for a conversation
  const joinPresence = useCallback(async () => {
    if (!conversationId || !user) return;

    // Get user profile for display
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    const presenceChannel = supabase.channel(`presence-${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users: ActiveUser[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const presence = presences[0] as Record<string, unknown>;
            users.push({
              id: key,
              user_id: presence.user_id as string,
              display_name: presence.display_name as string | null,
              avatar_url: presence.avatar_url as string | null,
              online_at: presence.online_at as string,
              cursor_position: presence.cursor_position as { x: number; y: number } | undefined,
              current_action: presence.current_action as string | undefined,
            });
          }
        });
        
        setActiveUsers(users.filter(u => u.user_id !== user.id));
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("User joined:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("User left:", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: user.id,
            display_name: profile?.display_name || user.email?.split("@")[0],
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = presenceChannel;
  }, [conversationId, user]);

  // Leave presence channel
  const leavePresence = useCallback(() => {
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }
    setActiveUsers([]);
  }, []);

  // Update presence state (e.g., cursor position)
  const updatePresence = useCallback(async (updates: Partial<Omit<ActiveUser, "id" | "user_id">>) => {
    if (!presenceChannelRef.current || !user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    await presenceChannelRef.current.track({
      user_id: user.id,
      display_name: profile?.display_name || user.email?.split("@")[0],
      avatar_url: profile?.avatar_url,
      online_at: new Date().toISOString(),
      ...updates,
    });
  }, [user]);

  // Subscribe to typing indicators
  const subscribeToTyping = useCallback(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`typing-${conversationId}`);

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const typingData = payload as TypingIndicator;
        
        setTypingUsers(prev => {
          const existing = prev.find(t => t.user_id === typingData.user_id);
          if (existing) {
            if (!typingData.is_typing) {
              return prev.filter(t => t.user_id !== typingData.user_id);
            }
            return prev.map(t => t.user_id === typingData.user_id ? typingData : t);
          }
          if (typingData.is_typing) {
            return [...prev, typingData];
          }
          return prev;
        });
      })
      .subscribe();

    channelRef.current = channel;
  }, [conversationId]);

  // Broadcast typing status
  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || !user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: user.id,
        display_name: profile?.display_name || user.email?.split("@")[0],
        is_typing: isTyping,
      },
    });
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, []);

  // Subscribe to share updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`shares-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_shares",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchShares();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchShares]);

  return {
    shares,
    activeUsers,
    typingUsers,
    isLoading,
    shareWithUser,
    shareWithWorkspace,
    updateSharePermission,
    removeShare,
    joinPresence,
    leavePresence,
    updatePresence,
    subscribeToTyping,
    broadcastTyping,
    refreshShares: fetchShares,
  };
}
