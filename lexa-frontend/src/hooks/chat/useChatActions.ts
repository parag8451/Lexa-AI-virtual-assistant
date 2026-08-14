import { useCallback } from "react";
import { ChatMessage } from "./useChatState";
import { generateId } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface UseChatActionsOptions {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentConversationId: string | null;
  conversations: any[];
  persistConversations: (convs: any[]) => void;
  isPrivateConversation: boolean;
  speakingMessageId: string | null;
  setSpeakingMessageId: (id: string | null) => void;
  generateId: () => string;
}

export function useChatActions({
  messages,
  setMessages,
  currentConversationId,
  conversations,
  persistConversations,
  isPrivateConversation,
  speakingMessageId,
  setSpeakingMessageId,
  generateId,
}: UseChatActionsOptions) {
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Content ready to paste." });
  }, []);

  const handleSpeak = useCallback((text: string, id: string) => {
    if (!("speechSynthesis" in window)) {
      toast({ title: "Speech synthesis not supported", variant: "destructive" });
      return;
    }
    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`\[\]]/g, "").replace(/\n/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  }, [speakingMessageId, setSpeakingMessageId]);

  const handleExport = useCallback(() => {
    if (messages.length === 0) return;
    const chatText = messages
      .map((m) => `### ${m.role === "user" ? "User" : "Lexa AI"} (${m.timestamp.toLocaleTimeString()}):\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([chatText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lexa-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Chat exported", description: "Markdown file downloaded." });
  }, [messages]);

  return { handleCopy, handleSpeak, handleExport };
}