import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, Citation } from "@/types/chat";
import { useAuth } from "./useAuth";

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    setConversations(data || []);
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    const formattedMessages: Message[] = (data || []).map((msg) => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      created_at: msg.created_at,
      model: msg.model || undefined,
      attachments: (msg.attachments as any[]) || [],
      citations: (msg.citations as any[]) || [],
    }));

    setMessages(formattedMessages);
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (title?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: title || "New Chat" })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversation(data);
    setMessages([]);
    return data;
  }, [user]);

  // Select a conversation
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setIsLoading(true);
    await fetchMessages(conversation.id);
    setIsLoading(false);
  }, [fetchMessages]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Error deleting conversation:", error);
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [currentConversation]);

  // Add a message to a conversation (OPTIMISTIC UPDATE FOR SPEED)
  // Can optionally pass a conversation directly (for newly created ones)
  const addMessage = useCallback(async (
    role: "user" | "assistant",
    content: string,
    attachments: any[] = [],
    citations: Citation[] = [],
    targetConversation?: Conversation | null
  ) => {
    const conv = targetConversation || currentConversation;
    if (!conv) return null;

    // Create optimistic message immediately for instant UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conv.id,
      role,
      content,
      created_at: new Date().toISOString(),
      attachments,
      citations,
    };

    // Update UI immediately (optimistic)
    setMessages((prev) => [...prev, optimisticMessage]);

    // Update conversation title if first user message
    if (messages.length === 0 && role === "user") {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id ? { ...c, title } : c
        )
      );
      setCurrentConversation((prev) => prev ? { ...prev, title } : null);
      
      // Update title in DB (fire and forget for speed)
      supabase
        .from("conversations")
        .update({ title })
        .eq("id", conv.id)
        .then(() => {});
    }

    // Save to database in background (don't await for speed)
    supabase
      .from("messages")
      .insert({
        conversation_id: conv.id,
        role,
        content,
        attachments,
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error saving message:", error);
          return;
        }
        // Replace temp ID with real ID
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, id: data.id }
              : m
          )
        );
      });

    return optimisticMessage;
  }, [currentConversation, messages.length]);

  // Update the last assistant message (for streaming)
  const updateLastAssistantMessage = useCallback((content: string, citations?: Citation[]) => {
    setMessages((prev) => {
      const lastIdx = prev.length - 1;
      if (lastIdx >= 0 && prev[lastIdx].role === "assistant") {
        const updated = [...prev];
        updated[lastIdx] = {
          ...updated[lastIdx],
          content,
          citations: citations || updated[lastIdx].citations,
        };
        return updated;
      }
      // Create new assistant message if not exists
      return [...prev, {
        id: `temp-${Date.now()}`,
        conversation_id: currentConversation?.id || "",
        role: "assistant" as const,
        content,
        created_at: new Date().toISOString(),
        attachments: [],
        citations: citations || [],
      }];
    });
  }, [currentConversation]);

  // Save the final assistant message to database (non-blocking for speed)
  const saveAssistantMessage = useCallback(async (content: string, model?: string, citations?: Citation[]) => {
    if (!currentConversation) return;

    const messageData = {
      conversation_id: currentConversation.id,
      role: "assistant" as const,
      content,
      model: model || null,
      citations: (citations as any) || null,
    };

    // Fire and forget for speed - don't await
    Promise.all([
      supabase.from("messages").insert(messageData),
      supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversation.id),
    ]).catch((error) => console.error("Error saving assistant message:", error));
  }, [currentConversation]);

  // Start a new chat
  const startNewChat = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateLastAssistantMessage,
    saveAssistantMessage,
    startNewChat,
    setMessages,
  };
}
