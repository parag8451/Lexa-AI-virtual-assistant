import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { streamChat } from "@/lib/streaming";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
}

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  systemPrompt?: string;
  memoryContext?: string;
  onMessageAdded?: (message: ChatMessage) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>(
    options.initialMessages || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Use refs for values that shouldn't trigger callback recreation
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Stable addMessage callback — no dependency on options object
  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
      };

      setMessages((prev) => [...prev, newMessage]);
      optionsRef.current.onMessageAdded?.(newMessage);
      return newMessage;
    },
    []
  );

  const updateMessage = useCallback(
    (id: string, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Stable send function — uses refs for messages and options to avoid recreation
  const send = useCallback(
    async (content: string, model?: string) => {
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to send messages",
          variant: "destructive",
        });
        return;
      }

      if (!content.trim()) {
        return;
      }

      // Stop any previous streaming
      stopStreaming();

      // Add user message
      addMessage({
        role: "user",
        content,
        timestamp: new Date(),
      });

      // Create assistant message placeholder
      const assistantMessage = addMessage({
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      });

      setIsLoading(true);
      setError(null);

      try {
        abortControllerRef.current = new AbortController();

        // Read current messages from ref (avoids stale closure)
        const currentMessages = messagesRef.current;
        const messageHistory: ChatMessage[] = currentMessages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role,
            content: m.content,
          } as ChatMessage));

        messageHistory.push({
          role: "user",
          content,
        } as ChatMessage);

        let accumulatedContent = "";

        const currentOptions = optionsRef.current;

        await streamChat({
          messages: messageHistory,
          model: model || "lexa-balanced",
          systemPrompt: currentOptions.systemPrompt,
          memoryContext: currentOptions.memoryContext,
          signal: abortControllerRef.current.signal,
          onDelta: (delta) => {
            accumulatedContent += delta;
            updateMessage(assistantMessage.id, { content: accumulatedContent });
          },
          onDone: () => {
            updateMessage(assistantMessage.id, { isStreaming: false });
            setIsLoading(false);
            abortControllerRef.current = null;
          },
          onError: (err) => {
            const errorMessage =
              err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            setIsLoading(false);

            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });

            updateMessage(assistantMessage.id, { isStreaming: false });
            deleteMessage(assistantMessage.id);
            abortControllerRef.current = null;
          },
        });
      } catch (err) {
        // Handle aborted requests
        if (err instanceof DOMException && err.name === "AbortError") {
          deleteMessage(assistantMessage.id);
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        setIsLoading(false);
        deleteMessage(assistantMessage.id);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [user, addMessage, updateMessage, deleteMessage, stopStreaming, toast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  // Memoize the return object to prevent object reference changes
  const returnValue = useMemo(
    () => ({
      messages,
      isLoading,
      error,
      addMessage,
      updateMessage,
      deleteMessage,
      clearMessages,
      send,
      stopStreaming,
    }),
    [messages, isLoading, error, addMessage, updateMessage, deleteMessage, clearMessages, send, stopStreaming]
  );

  return returnValue;
}