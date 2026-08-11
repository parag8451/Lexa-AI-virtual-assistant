import { useReducer, useCallback, useRef, useEffect, useMemo } from "react";
import { streamChat } from "@/lib/streaming";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
}

export type ChatStatus = "idle" | "isInitialLoading" | "isStreaming" | "isRetrying" | "isError";

interface ChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: "DELETE_MESSAGE"; payload: { id: string } }
  | { type: "SET_STATUS"; payload: ChatStatus }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_MESSAGES" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        ),
      };
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload.id),
      };
    case "SET_STATUS":
      return {
        ...state,
        status: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        status: action.payload ? "isError" : state.status,
      };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
        error: null,
        status: "idle",
      };
    default:
      return state;
  }
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

  const [state, dispatch] = useReducer(chatReducer, {
    messages: options.initialMessages || [],
    status: "idle",
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Maintain stable options ref
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Maintain stable messages ref for closures
  const messagesRef = useRef(state.messages);
  messagesRef.current = state.messages;

  // Stable addMessage callback
  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
      };

      dispatch({ type: "ADD_MESSAGE", payload: newMessage });
      optionsRef.current.onMessageAdded?.(newMessage);
      return newMessage;
    },
    []
  );

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates } });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    dispatch({ type: "DELETE_MESSAGE", payload: { id } });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  // Resilient stream cancellation: preserves partial message output cleanly
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch({ type: "SET_STATUS", payload: "idle" });

      // Clean up streaming state flag on last assistant message if active
      const currentMsgs = messagesRef.current;
      const lastMsg = currentMsgs[currentMsgs.length - 1];
      if (lastMsg && lastMsg.role === "assistant" && lastMsg.isStreaming) {
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: { id: lastMsg.id, updates: { isStreaming: false } },
        });
      }
    }
  }, []);

  // Send message implementation with state machine transitions
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

      if (!content.trim()) return;

      stopStreaming();

      // Optimistic user message addition
      addMessage({
        role: "user",
        content,
        timestamp: new Date(),
      });

      // Place assistant placeholder
      const assistantMessage = addMessage({
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      });

      dispatch({ type: "SET_STATUS", payload: "isStreaming" });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        abortControllerRef.current = new AbortController();

        const currentMessages = messagesRef.current;
        const messageHistory: ChatMessage[] = currentMessages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role,
            content: m.content,
          } as ChatMessage));

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
            dispatch({ type: "SET_STATUS", payload: "idle" });
            abortControllerRef.current = null;
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            dispatch({ type: "SET_ERROR", payload: errorMessage });
            dispatch({ type: "SET_STATUS", payload: "isError" });

            updateMessage(assistantMessage.id, { isStreaming: false, isError: true });
            abortControllerRef.current = null;

            toast({
              title: "Connection Error",
              description: errorMessage,
              variant: "destructive",
            });
          },
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Intentional user cancellation — retain partial message content
          return;
        }

        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        dispatch({ type: "SET_STATUS", payload: "isError" });
        updateMessage(assistantMessage.id, { isStreaming: false, isError: true });

        toast({
          title: "Stream Exception",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [user, addMessage, updateMessage, stopStreaming, toast]
  );

  // Non-destructive retry function
  const retryLastMessage = useCallback(
    async (model?: string) => {
      const currentMsgs = messagesRef.current;
      if (currentMsgs.length === 0) return;

      let lastUserMsgIndex = -1;
      for (let i = currentMsgs.length - 1; i >= 0; i--) {
        if (currentMsgs[i].role === "user") {
          lastUserMsgIndex = i;
          break;
        }
      }

      if (lastUserMsgIndex === -1) return;

      const lastUserContent = currentMsgs[lastUserMsgIndex].content;

      // Remove previous failed assistant message if existing
      if (currentMsgs.length > lastUserMsgIndex + 1) {
        const nextMsg = currentMsgs[lastUserMsgIndex + 1];
        if (nextMsg.role === "assistant") {
          deleteMessage(nextMsg.id);
        }
      }

      dispatch({ type: "SET_STATUS", payload: "isRetrying" });
      await send(lastUserContent, model);
    },
    [deleteMessage, send]
  );

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  // Derived state indicators
  const isLoading = state.status === "isInitialLoading" || state.status === "isStreaming" || state.status === "isRetrying";

  return useMemo(
    () => ({
      messages: state.messages,
      status: state.status,
      isLoading,
      error: state.error,
      addMessage,
      updateMessage,
      deleteMessage,
      clearMessages,
      send,
      retryLastMessage,
      stopStreaming,
    }),
    [state.messages, state.status, isLoading, state.error, addMessage, updateMessage, deleteMessage, clearMessages, send, retryLastMessage, stopStreaming]
  );
}