import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, FileAttachment, StoredConversation } from "./useChatState";

interface SendMessageOptions {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputValue: string;
  setInputValue: (value: string) => void;
  attachments: FileAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
  selectedModel: string;
  webSearchEnabled: boolean;
  designMode: "assistant" | "code" | "web" | "mobile";
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  conversations: StoredConversation[];
  persistConversations: (convs: StoredConversation[]) => void;
  isPrivateConversation: boolean;
  generateId: () => string;
  onError?: (error: string) => void;
}

const CHAT_ENDPOINT = (import.meta.env.VITE_CHAT_ENDPOINT as string) || '/api/chat';

export function useSendMessage({
  messages,
  setMessages,
  inputValue,
  setInputValue,
  attachments,
  setAttachments,
  isStreaming,
  setIsStreaming,
  selectedModel,
  webSearchEnabled,
  designMode,
  currentConversationId,
  setCurrentConversationId,
  conversations,
  persistConversations,
  isPrivateConversation,
  generateId,
  onError,
}: SendMessageOptions) {
  const speakingMessageIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (overrideContent?: string, overrideAttachments?: FileAttachment[]) => {
    const content = (overrideContent ?? inputValue).trim();
    const currentAttachments = overrideAttachments ?? attachments;

    if ((!content && currentAttachments.length === 0) || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content || "Please analyze the attached file(s).",
      attachments: currentAttachments.length > 0 ? [...currentAttachments] : undefined,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setAttachments([]);
    setIsStreaming(true);

    let activeConvId = currentConversationId;
    let currentTitle = "";
    if (!activeConvId) {
      activeConvId = generateId();
      setCurrentConversationId(activeConvId);
      currentTitle = content.length > 38 ? content.slice(0, 38) + "..." : content || "Multimodal Scan";
      const newConv: StoredConversation = {
        id: activeConvId,
        title: currentTitle,
        model: selectedModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: nextMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          attachments: m.attachments,
          timestamp: m.timestamp.toISOString(),
        })),
      };
      if (!isPrivateConversation) persistConversations([newConv, ...conversations]);
    } else {
      const updated = conversations.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              updatedAt: Date.now(),
              messages: nextMessages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                attachments: m.attachments,
                timestamp: m.timestamp.toISOString(),
              })),
            }
          : c
      );
      if (!isPrivateConversation) persistConversations(updated);
    }

    const aiMessageId = generateId();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: "ai",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    let accumulatedContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
      if (activeConvId) headers["x-conversation-id"] = activeConvId;

      const attachmentsPayload = currentAttachments.map((a) => ({
        name: a.name,
        type: a.type,
        data: a.base64Data,
        textContent: a.textContent,
      }));

      let response: Response | null = null;
      try {
        response = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({
                role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
                content: m.content,
              })),
              { role: "user" as const, content: content || "Analyze attached file(s)." },
            ],
            attachments: attachmentsPayload,
            model: selectedModel,
            webSearch: webSearchEnabled,
            mode: designMode,
          }),
        });
      } catch (backendNetErr) {
        console.warn("Backend server connection failed, attempting direct client fallback...", backendNetErr);
      }

      if (response && response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                const openaiDelta = parsed?.choices?.[0]?.delta?.content;
                if (openaiDelta) {
                  accumulatedContent += openaiDelta;
                } else if (parsed.type === "text_delta" && parsed.text) {
                  accumulatedContent += parsed.text;
                } else if (parsed.text) {
                  accumulatedContent += parsed.text;
                } else if (parsed.finalText) {
                  accumulatedContent = parsed.finalText;
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
                  )
                );
              } catch (e) {}
            }
          }
        }
      } else {
        throw new Error("Backend server unavailable. Please check your connection.");
      }
    } catch (err: any) {
      console.error("Chat generation error:", err);
      accumulatedContent = `I encountered an issue processing your request: "${err.message || 'Connection failed'}". Please verify your API key in Settings > Integrations.`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: accumulatedContent, isStreaming: false } : msg
        )
      );
      onError?.(err.message || 'Connection failed');
    } finally {
      setIsStreaming(false);
      const finalAiMsg: ChatMessage = {
        id: aiMessageId,
        role: "ai",
        content: accumulatedContent,
        timestamp: new Date(),
        isStreaming: false,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg))
      );

      const allFinalMessages = [...nextMessages, finalAiMsg];
      if (!isPrivateConversation) {
        setConversations((prevConvs) => {
          const updated = prevConvs.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  messages: allFinalMessages.map((m) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    attachments: m.attachments,
                    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
                  })),
                }
              : c
          );
          try {
            localStorage.setItem("lexa_saved_conversations_v3", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }
  }, [
    messages,
    setMessages,
    inputValue,
    setInputValue,
    attachments,
    setAttachments,
    isStreaming,
    setIsStreaming,
    selectedModel,
    webSearchEnabled,
    designMode,
    currentConversationId,
    setCurrentConversationId,
    conversations,
    persistConversations,
    isPrivateConversation,
    generateId,
    onError,
  ]);

  return { sendMessage };
}