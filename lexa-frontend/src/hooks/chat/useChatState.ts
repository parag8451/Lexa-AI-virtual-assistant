import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseFile, FileAttachment, formatFileSize } from "@/lib/fileParser";
import { generateId } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
}

interface StoredConversation {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  messages: Array<{
    id: string;
    role: "user" | "ai";
    content: string;
    attachments?: FileAttachment[];
    timestamp: string | Date;
  }>;
}

const STORAGE_KEY = "lexa_saved_conversations_v3";

const AVAILABLE_MODELS = [
  { id: "gemini-1.5-flash", name: "Lexa Fast", badge: "Fast", desc: "Low-latency multimodal assistant with live vision", icon: Zap },
  { id: "gemini-1.5-flash-8b", name: "Lexa Balanced", badge: "Balanced", desc: "Balanced intelligence for general reasoning", icon: Cpu },
  { id: "gemini-1.5-pro", name: "Lexa Pro", badge: "Pro", desc: "Deep reasoning, documents, and complex code", icon: Sparkles },
];

function groupConversations(convs: StoredConversation[]) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const groups: { [key: string]: StoredConversation[] } = {
    "Today": [],
    "Yesterday": [],
    "Previous 7 Days": [],
    "Older": [],
  };

  convs.forEach((c) => {
    const diff = now - c.updatedAt;
    if (diff < oneDay) groups["Today"].push(c);
    else if (diff < 2 * oneDay) groups["Yesterday"].push(c);
    else if (diff < 7 * oneDay) groups["Previous 7 Days"].push(c);
    else groups["Older"].push(c);
  });

  return groups;
}

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<"assistant" | "code" | "web" | "mobile">("assistant");
  const [isPrivateConversation, setIsPrivateConversation] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const conversations = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);
  
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const hasMessages = messages.length > 0;
  const currentModelInfo = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const persistConversations = useCallback((updated: StoredConversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, []);

  // Sync with Supabase on mount
  useEffect(() => {
    async function syncSupabaseConversations() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false });
        if (!error && data && data.length > 0) {
          const dbConvs: StoredConversation[] = data.map((d: any) => ({
            id: d.id,
            title: d.title || "Conversation",
            model: d.model || "gemini-3.5-flash",
            createdAt: new Date(d.created_at).getTime(),
            updatedAt: new Date(d.updated_at || d.created_at).getTime(),
            messages: Array.isArray(d.messages) ? d.messages : [],
          }));
          const map = new Map<string, StoredConversation>();
          conversations.forEach((c) => map.set(c.id, c));
          dbConvs.forEach((c) => map.set(c.id, c));
          const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
          persistConversations(merged);
        }
      } catch (err) {
        console.warn("Supabase sync skipped:", err);
      }
    }
    syncSupabaseConversations();
  }, [conversations, persistConversations]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputValue(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    if (!chatAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if (!("speechSynthesis" in window)) return;
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
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const parsedList: FileAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const att = await parseFile(files[i]);
        parsedList.push(att);
      } catch (err) {
        console.error("File parse error:", err);
      }
    }
    if (parsedList.length > 0) {
      setAttachments((prev) => [...prev, ...parsedList]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCameraCaptureAndSend = (attachment: FileAttachment, promptPreset?: string) => {
    setAttachments((prev) => [...prev, attachment]);
    if (promptPreset) {
      // sendMessage will be called by parent
    }
  };

  const handleSelectConversation = (conv: StoredConversation) => {
    if (isStreaming) return;
    if (speakingMessageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setCurrentConversationId(conv.id);
    setSelectedModel(conv.model || "gemini-3.5-flash");
    setMessages(
      conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        attachments: m.attachments,
        timestamp: new Date(m.timestamp),
      }))
    );
    if (window.innerWidth < 768) setIsHistoryOpen(false);
  };

  const handleNewChat = () => {
    if (isStreaming) return;
    if (speakingMessageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setCurrentConversationId(null);
    setMessages([]);
    setAttachments([]);
    if (window.innerWidth < 768) setIsHistoryOpen(false);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    persistConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
      setAttachments([]);
    }
  };

  const handleStartRename = (conv: StoredConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: editingTitle.trim() } : c
    );
    persistConversations(updated);
    setEditingConvId(null);
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all conversation history?")) {
      persistConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
      setAttachments([]);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(historySearch.toLowerCase())
  );
  const groupedHistory = groupConversations(filteredConversations);

  const getPlaceholder = () => {
    if (attachments.length > 0) return `Ask about ${attachments.length} attached item(s)...`;
    switch (designMode) {
      case "code": return "Ask for code, architecture, algorithms, or refactoring...";
      case "web": return "What web application or component shall we build?";
      case "mobile": return "What native mobile feature or screen shall we design?";
      default: return "Ask Lexa AI anything, attach files, or scan documents...";
    }
  };

  return {
    // State
    messages,
    setMessages,
    inputValue,
    setInputValue,
    attachments,
    setAttachments,
    isStreaming,
    setIsStreaming,
    isListening,
    setIsListening,
    selectedModel,
    setSelectedModel,
    webSearchEnabled,
    setWebSearchEnabled,
    showScrollBtn,
    setShowScrollBtn,
    speakingMessageId,
    setSpeakingMessageId,
    designMode,
    setDesignMode,
    isPrivateConversation,
    setIsPrivateConversation,
    previewImageUrl,
    setPreviewImageUrl,
    currentConversationId,
    setCurrentConversationId,
    isHistoryOpen,
    setIsHistoryOpen,
    historySearch,
    setHistorySearch,
    editingConvId,
    setEditingConvId,
    editingTitle,
    setEditingTitle,
    conversations,
    currentModelInfo,
    hasMessages,
    chatAreaRef,
    fileInputRef,
    filteredConversations,
    groupedHistory,
    AVAILABLE_MODELS,
    // Handlers
    scrollToBottom,
    handleScroll,
    toggleSpeechRecognition,
    handleSpeak,
    handleCopy,
    handleFileUpload,
    removeAttachment,
    handleCameraCaptureAndSend,
    handleSelectConversation,
    handleNewChat,
    handleDeleteConversation,
    handleStartRename,
    handleSaveRename,
    handleClearAllHistory,
    getPlaceholder,
    persistConversations,
    generateId,
  };
}