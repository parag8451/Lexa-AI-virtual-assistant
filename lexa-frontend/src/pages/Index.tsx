import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ArrowDown, ArrowUp, Copy, Check, ThumbsUp, ThumbsDown,
  Plus, Settings, Sparkles, ChevronDown, Mic, MicOff, Lock, Unlock,
  Volume2, VolumeX, Download, Trash2, Globe, CheckCircle2,
  Cpu, Zap, Wand2, Smartphone, Code2, Paperclip, MessageSquare,
  History, Search, Edit2, X, Clock, PanelLeftClose, Camera, FileText,
  FileCode, Eye, Radio, Terminal, Layout, Image as ImageIcon, HelpCircle, Bot
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import "@/components/chat/CustomChatUI.css";
import Grainient from "@/components/effects/Grainient";
import { HeroRotatingTitle } from "@/components/chat/HeroRotatingTitle";
import { SafeMarkdown } from "@/components/chat/SafeMarkdown";
import { RadiantPromptInput } from "@/components/chat/RadiantPromptInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { parseFile, FileAttachment, formatFileSize } from "@/lib/fileParser";
import { CameraScannerModal } from "@/components/chat/CameraScannerModal";
import { RealtimeTalkingAssistant } from "@/components/chat/RealtimeTalkingAssistant";
import { useSEO } from "@/hooks/useSEO";

/* ─── Types ─── */
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
    if (diff < oneDay) {
      groups["Today"].push(c);
    } else if (diff < 2 * oneDay) {
      groups["Yesterday"].push(c);
    } else if (diff < 7 * oneDay) {
      groups["Previous 7 Days"].push(c);
    } else {
      groups["Older"].push(c);
    }
  });

  return groups;
}

const AVAILABLE_MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "Fast", desc: "Low-latency multimodal assistant with live vision", icon: Zap },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", badge: "Balanced", desc: "Balanced intelligence for general reasoning", icon: Cpu },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", badge: "Pro", desc: "Deep reasoning, documents, and complex code", icon: Sparkles },
  { id: "gpt-4o", name: "GPT-4o", badge: "OpenAI", desc: "Multimodal GPT-4o with high accuracy", icon: Wand2 },
];

/* ─── Helper: Unique ID generator ─── */
function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ─── Error Fallback ─── */
function ChatFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-white p-8 text-center" style={{ zIndex: 10 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <Sparkles className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-red-400/80 max-w-md text-sm">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="mt-2 px-6 py-2.5 bg-white text-zinc-950 font-semibold rounded-xl text-sm shadow-md hover:bg-zinc-200 transition-all active:scale-95"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}

/* ─── Message Bubble Component ─── */
function MessageBubble({
  message,
  onCopy,
  onSpeak,
  isSpeaking,
  onPreviewImage,
}: {
  message: ChatMessage;
  onCopy: (text: string) => void;
  onSpeak?: (text: string, id: string) => void;
  isSpeaking?: boolean;
  onPreviewImage?: (url: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`message ${message.role === "user" ? "user" : "ai"}`}
    >
      {message.role === "ai" && (
        <div className="avatar ai shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      )}

      <div className="message-body flex-1 min-w-0">
        {/* Render Attachments in User Bubble */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att) => (
              <div key={att.id} className="relative group">
                {att.isImage ? (
                  <div
                    onClick={() => onPreviewImage?.(att.dataUrl)}
                    className="relative cursor-pointer overflow-hidden rounded-xl border border-white/20 shadow-md hover:border-cyan-400 transition-all active:scale-95"
                  >
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1f2e]/90 border border-white/12 rounded-xl text-xs text-zinc-200 shadow-sm">
                    {att.isPdf ? (
                      <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate max-w-[130px] font-medium">{att.name}</span>
                      <span className="text-[10px] text-zinc-400">{formatFileSize(att.size)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bubble text-sm sm:text-base leading-relaxed">
          {message.role === "user" ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="ai-markdown prose prose-invert max-w-none">
              <SafeMarkdown content={message.content} />
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Message Actions */}
        {message.role === "ai" && !message.isStreaming && (
          <div className="message-actions flex items-center gap-1 mt-2 text-zinc-400">
            <button
              onClick={handleCopy}
              className="action-btn hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors active:scale-95"
              title={copied ? "Copied" : "Copy response"}
              aria-label="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {onSpeak && (
              <button
                onClick={() => onSpeak(message.content, message.id)}
                className={`action-btn p-1.5 rounded-lg transition-colors active:scale-95 ${
                  isSpeaking ? "text-cyan-400 bg-cyan-500/15 border border-cyan-500/30" : "hover:text-white hover:bg-white/10"
                }`}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                aria-label="Read aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={() => setReaction(reaction === "up" ? null : "up")}
              className={`action-btn p-1.5 rounded-lg transition-colors active:scale-95 ${
                reaction === "up" ? "text-emerald-400 bg-emerald-500/15" : "hover:text-white hover:bg-white/10"
              }`}
              title="Good response"
              aria-label="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setReaction(reaction === "down" ? null : "down")}
              className={`action-btn p-1.5 rounded-lg transition-colors active:scale-95 ${
                reaction === "down" ? "text-rose-400 bg-rose-500/15" : "hover:text-white hover:bg-white/10"
              }`}
              title="Bad response"
              aria-label="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {message.role === "user" && (
        <div className="avatar user shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
            U
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Scroll to Bottom Button ─── */
function ScrollToBottomButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="fixed bottom-24 right-8 z-30 p-2.5 rounded-full bg-[#181a24] border border-white/15 text-white shadow-xl hover:bg-[#222533] transition-colors"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-cyan-400" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Chat Content ─── */
function IndexContent() {
  useSEO({
    title: "Chat",
    description: "Chat with Lexa AI, your personal intelligent assistant.",
    canonicalUrl: "/chat",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<"assistant" | "code" | "web" | "mobile">("assistant");
  const [pageReady, setPageReady] = useState(false);
  const [isPrivateConversation, setIsPrivateConversation] = useState(false);

  // Modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Expose private mode to other hooks via a global window flag
  useEffect(() => {
    try {
      (window as any).__LEXA_PRIVATE_MODE = isPrivateConversation === true;
    } catch (e) {}
  }, [isPrivateConversation]);

  // Endpoint for chat backend
  const CHAT_ENDPOINT = (import.meta.env.VITE_CHAT_ENDPOINT as string) || '/api/chat';

  // Conversation history states
  const [conversations, setConversations] = useState<StoredConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const hasMessages = messages.length > 0;
  const currentModelInfo = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  /* Helper to save conversations */
  const persistConversations = useCallback((updated: StoredConversation[]) => {
    setConversations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, []);

  /* Sync with Supabase on mount if user is logged in */
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
          setConversations((prev) => {
            const map = new Map<string, StoredConversation>();
            prev.forEach((c) => map.set(c.id, c));
            dbConvs.forEach((c) => map.set(c.id, c));
            const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.warn("Supabase sync skipped:", err);
      }
    }
    syncSupabaseConversations();
  }, []);

  /* Cinematic page fade-in */
  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageReady(true), 300);
    return () => clearTimeout(fadeTimer);
  }, []);

  /* Auto-scroll to bottom */
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

  /* Scroll event listener */
  const handleScroll = () => {
    if (!chatAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  /* Speech recognition setup */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Could not access microphone.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak clearly into your microphone.",
        });
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  /* Text to Speech */
  const handleSpeak = (text: string, id: string) => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Speech synthesis not supported",
        variant: "destructive",
      });
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
  };

  /* Copy message handler */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content ready to paste.",
    });
  };

  /* Handle File Uploads */
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
      toast({
        title: `${parsedList.length} file(s) attached`,
        description: parsedList.map((f) => f.name).join(", "),
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  /* Handle Camera capture and direct prompt */
  const handleCameraCaptureAndSend = (attachment: FileAttachment, promptPreset?: string) => {
    setAttachments((prev) => [...prev, attachment]);
    if (promptPreset) {
      sendMessage(promptPreset, [...attachments, attachment]);
    }
  };

  /* Select and load conversation from history */
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
    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }
  };

  /* New chat */
  const handleNewChat = () => {
    if (isStreaming) return;
    if (speakingMessageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setCurrentConversationId(null);
    setMessages([]);
    setAttachments([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }
  };

  /* Delete conversation */
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    persistConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
      setAttachments([]);
    }
    toast({
      title: "Conversation deleted",
      description: "Chat session removed from history.",
    });
  };

  /* Start rename */
  const handleStartRename = (conv: StoredConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  /* Save rename */
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
    toast({
      title: "Conversation renamed",
    });
  };

  /* Clear all history */
  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all conversation history?")) {
      persistConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
      setAttachments([]);
      toast({
        title: "History cleared",
        description: "All past conversations have been deleted.",
      });
    }
  };

  /* Send message */
  const sendMessage = async (overrideContent?: string, overrideAttachments?: FileAttachment[]) => {
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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      if (activeConvId) {
        headers["x-conversation-id"] = activeConvId;
      }

      // Prepare attachment payload for backend
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
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } catch (e) {}
            }
          }
        }
      } else {
        // Direct Gemini client-side fallback
        const clientApiKey =
          localStorage.getItem("lexa_gemini_key") ||
          import.meta.env.VITE_GEMINI_API_KEY ||
          "";

        if (clientApiKey) {
          const latestParts: any[] = [
            { text: content || "Please analyze this attached document or image in detail." },
          ];

          for (const att of currentAttachments) {
            if (att.textContent) {
              latestParts.push({
                text: `\n\n[Attached File: ${att.name}]\n\`\`\`\n${att.textContent}\n\`\`\``,
              });
            } else if (att.base64Data && (att.isImage || att.isPdf)) {
              latestParts.push({
                inlineData: {
                  mimeType: att.type,
                  data: att.base64Data,
                },
              });
            }
          }

          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${clientApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  ...messages.slice(-10).map((m) => ({
                    role: m.role === "ai" ? "model" : "user",
                    parts: [{ text: m.content }],
                  })),
                  { role: "user", parts: latestParts },
                ],
                systemInstruction: {
                  parts: [
                    {
                      text: "You are Lexa AI, an advanced multimodal assistant. Provide accurate vision analysis, OCR extraction, document summaries, and high-quality structured answers.",
                    },
                  ],
                },
              }),
            }
          );

          if (directRes.ok && directRes.body) {
            const reader = directRes.body.getReader();
            const decoder = new TextDecoder();
            let buf = "";

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              buf += decoder.decode(value, { stream: true });
              const lines = buf.split("\n");
              buf = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const parsed = JSON.parse(line.slice(6).trim());
                    const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (delta) {
                      accumulatedContent += delta;
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === aiMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                        )
                      );
                    }
                  } catch {}
                }
              }
            }
          } else {
            throw new Error(`Direct Gemini API failed with status ${directRes.status}`);
          }
        } else {
          throw new Error("Backend server unavailable and no API key configured. Check Settings > Integrations.");
        }
      }
    } catch (err: any) {
      console.error("Chat generation error:", err);
      accumulatedContent = `I encountered an issue processing your request: "${err.message || 'Connection failed'}". Please verify your API key in Settings > Integrations.`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: accumulatedContent, isStreaming: false }
            : msg
        )
      );
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
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        )
      );

      // Save complete conversation history
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }
  };

  /* Input keydown */
  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* Textarea auto-resize */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  /* Export chat */
  const handleExport = () => {
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
    toast({
      title: "Chat exported",
      description: "Markdown file downloaded.",
    });
  };

  /* Filtered and grouped conversations */
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(historySearch.toLowerCase())
  );
  const groupedHistory = groupConversations(filteredConversations);

  /* Categorized Suggestions */
  const suggestionsMap = {
    assistant: [
      { emoji: "📷", text: "Scan and transcribe a document or handwritten page" },
      { emoji: "⚡", text: "Explain quantum computing algorithms in plain English" },
      { emoji: "🚀", text: "Help me draft a high-impact technical launch strategy" },
    ],
    code: [
      { emoji: "💻", text: "Write a high-performance LRU cache in TypeScript with O(1) ops" },
      { emoji: "⚡", text: "Architect a scalable microservices auth service with JWT" },
      { emoji: "🔍", text: "Optimize a complex SQL aggregation query with indexing" },
    ],
    web: [
      { emoji: "✨", text: "Create a modern glassmorphism dark-mode UI in React & Tailwind" },
      { emoji: "🌐", text: "Build an interactive charts dashboard with real-time SSE streaming" },
      { emoji: "🎨", text: "Design an accessible navigation drawer with smooth spring physics" },
    ],
    mobile: [
      { emoji: "📱", text: "Design an animated onboarding carousel for a fitness mobile app" },
      { emoji: "⚡", text: "Create an offline-first SQLite sync flow for React Native" },
      { emoji: "🎯", text: "Build a swipeable card stack gesture component for iOS" },
    ],
  };

  const getPlaceholder = () => {
    if (attachments.length > 0) {
      return `Ask about ${attachments.length} attached item(s)...`;
    }
    switch (designMode) {
      case "code":
        return "Ask for code, architecture, algorithms, or refactoring...";
      case "web":
        return "What web application or component shall we build?";
      case "mobile":
        return "What native mobile feature or screen shall we design?";
      default:
        return "Ask Lexa AI anything, attach files, or scan documents...";
    }
  };

  return (
    <div className="flex h-screen bg-[#020205] text-white font-sans overflow-hidden relative">
      
      {/* Dynamic Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Grainient
          color1="#090924"
          color2="#040013"
          color3="#1249ff"
          timeSpeed={1.85}
          colorBalance={-0.47}
          warpStrength={0}
          warpFrequency={3.3}
          warpSpeed={6}
          warpAmplitude={72}
          blendAngle={0}
          blendSoftness={0.4}
          rotationAmount={120}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={1.7}
          grainAnimated
          contrast={1.75}
          gamma={1}
          saturation={2.5}
          centerX={0}
          centerY={0}
          zoom={0.95}
        />
      </div>

      {/* Hidden File Input for Attachment */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*,application/pdf,text/*,.json,.csv,.md,.ts,.tsx,.js,.py,.html,.css"
        className="hidden"
      />

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureAndSend={handleCameraCaptureAndSend}
      />

      {/* Real-time Voice Talking Assistant Modal */}
      <RealtimeTalkingAssistant
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onSendToChatHistory={(userText, aiText) => {
          const uMsg: ChatMessage = { id: generateId(), role: "user", content: userText, timestamp: new Date() };
          const aMsg: ChatMessage = { id: generateId(), role: "ai", content: aiText, timestamp: new Date() };
          setMessages((prev) => [...prev, uMsg, aMsg]);
        }}
      />

      {/* Image Zoom Lightbox Modal */}
      <AnimatePresence>
        {previewImageUrl && (
          <div
            onClick={() => setPreviewImageUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImageUrl}
                alt="Enlarged preview"
                className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl border border-white/20 object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black border border-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-16 py-6 border-r border-white/5 bg-[#020205] flex flex-col items-center relative z-30 shrink-0">
        
        <div className="flex flex-col items-center gap-6 mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleNewChat}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New Chat</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <Radio className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Voice Assistant</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsPrivateConversation((p) => !p)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isPrivateConversation ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isPrivateConversation ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Privacy Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsHistoryOpen((prev) => !prev)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isHistoryOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/10 hover:text-white"
                }`}
              >
                <History className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Conversations</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="mt-auto w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </aside>

      {/* ─── Slide-out Conversation History Drawer ─── */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-screen bg-[#0e1017]/95 border-r border-white/10 backdrop-blur-2xl z-30 flex flex-col overflow-hidden shrink-0 shadow-2xl relative"
          >
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38bdf8]" />
                <span className="font-semibold text-sm text-white">Chat History</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors active:scale-95"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors active:scale-95"
                  title="Close History"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-white/5">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-[#161822] text-xs text-white pl-8 pr-7 py-2 rounded-xl border border-white/10 focus:border-[#38bdf8]/50 focus:outline-none placeholder:text-zinc-500"
                />
                {historySearch && (
                  <button
                    onClick={() => setHistorySearch("")}
                    className="absolute right-2.5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Group List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2.5 text-zinc-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-zinc-400">
                    {historySearch ? "No matching conversations" : "No conversation history yet"}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    {historySearch ? "Try searching for a different keyword" : "Start a new chat to see history here"}
                  </p>
                </div>
              ) : (
                Object.entries(groupedHistory).map(([groupTitle, convs]) => {
                  if (convs.length === 0) return null;
                  return (
                    <div key={groupTitle} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {groupTitle}
                      </div>
                      {convs.map((conv) => {
                        const isActive = conv.id === currentConversationId;
                        const isEditing = editingConvId === conv.id;

                        return (
                          <div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv)}
                            className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                              isActive
                                ? "bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-white font-medium shadow-sm"
                                : "hover:bg-white/5 text-zinc-300 border border-transparent hover:border-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                              <MessageSquare
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? "text-[#38bdf8]" : "text-zinc-500 group-hover:text-zinc-300"
                                }`}
                              />
                              {isEditing ? (
                                <form
                                  onSubmit={(e) => handleSaveRename(conv.id, e)}
                                  className="flex items-center gap-1 w-full"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    autoFocus
                                    className="bg-black/50 text-xs text-white px-1.5 py-0.5 rounded border border-white/20 w-full focus:outline-none"
                                  />
                                  <button
                                    type="submit"
                                    className="p-1 hover:text-emerald-400 text-zinc-400"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingConvId(null)}
                                    className="p-1 hover:text-rose-400 text-zinc-400"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </form>
                              ) : (
                                <span className="truncate">{conv.title}</span>
                              )}
                            </div>

                            {!isEditing && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                                <button
                                  onClick={(e) => handleStartRename(conv, e)}
                                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                                  className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-rose-400"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            {conversations.length > 0 && (
              <div className="p-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{conversations.length} sessions</span>
                <button
                  onClick={handleClearAllHistory}
                  className="text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main ─── */}
      <main className="flex-1 flex flex-col relative z-10" role="main">

        {/* Cinematic power-on black fade overlay */}
        <AnimatePresence>
          {!pageReady && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="fixed inset-0 bg-[#090a0e] z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* ── TOP STATUS BAR ── */}
        <header className="absolute top-0 w-full px-8 py-4 flex items-center justify-end gap-4 z-40">
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5" style={{ background: 'rgba(10, 10, 12, 0.6)', backdropFilter: 'blur(20px)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[11px] text-zinc-300">LEXA AI 2.0 | Live Talking AI</span>
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
          </div>

          {/* Scan/OCR Button */}
          <button 
            onClick={() => setIsCameraModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] text-zinc-300 hover:bg-white/10 transition-colors border border-transparent"
            style={{ background: 'rgba(10, 10, 12, 0.6)', backdropFilter: 'blur(20px)' }}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan / OCR</span>
          </button>

          {/* Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] text-zinc-300 hover:bg-white/10 transition-colors border border-transparent"
                style={{ background: 'rgba(10, 10, 12, 0.6)', backdropFilter: 'blur(20px)' }}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentModelInfo.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#14151e]/95 backdrop-blur-xl border border-white/10 text-white p-2 shadow-2xl z-50 rounded-2xl">
              <DropdownMenuLabel className="text-xs text-zinc-400 uppercase tracking-wider px-2 py-1">
                Select AI Model
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {AVAILABLE_MODELS.map((model) => {
                const Icon = model.icon;
                const isSelected = selectedModel === model.id;
                return (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? "bg-[#38BDF8]/15 text-white" : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#38BDF8]" : "text-zinc-400"}`} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{model.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 font-medium">
                          {model.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 truncate">{model.desc}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sign In / New Button */}
          {hasMessages ? (
            <button
              onClick={handleNewChat}
              className="ml-2 px-4 py-1.5 bg-white text-black rounded-full text-[11px] font-bold hover:bg-zinc-200 transition-colors"
            >
              New Chat
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="ml-2 px-4 py-1.5 bg-white text-black rounded-full text-[11px] font-bold hover:bg-zinc-200 transition-colors"
            >
              Sign In
            </button>
          )}
        </header>

        {/* Main scrollable area */}
        <div 
          className="flex-1 overflow-y-auto scroll-smooth pb-4 px-6 relative z-10 custom-scrollbar flex flex-col" 
          ref={chatAreaRef}
          id="chatArea"
          onScroll={handleScroll}
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            {!hasMessages && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
                className="w-full py-6 flex flex-col items-center justify-center text-center my-auto shrink-0 gap-[76px]"
              >
                {/* Animated Typing Title */}
                <HeroRotatingTitle />

                  {/* RADIANT INPUT AND SUGGESTION PILLS */}
                  <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 mx-auto">
                    <RadiantPromptInput 
                      value={inputValue}
                      onChange={handleInputChange}
                      onSubmit={() => sendMessage()}
                      disabled={isStreaming}
                      placeholder={getPlaceholder()}
                      designMode={designMode}
                      setDesignMode={setDesignMode}
                      webSearchEnabled={webSearchEnabled}
                      setWebSearchEnabled={setWebSearchEnabled}
                      isListening={isListening}
                      toggleSpeechRecognition={toggleSpeechRecognition}
                      setIsVoiceAssistantOpen={setIsVoiceAssistantOpen}
                      attachments={attachments}
                      onAttachmentClick={() => fileInputRef.current?.click()}
                      onRemoveAttachment={removeAttachment}
                      onPreviewAttachment={(url) => setPreviewImageUrl(url)}
                    />

                    {/* SUGGESTION PILLS */}
                    <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-zinc-500 font-medium">
                      {suggestionsMap[designMode].map((s, idx) => (
                        <button 
                          key={idx}
                          onClick={() => sendMessage(s.text)}
                          disabled={isStreaming}
                          className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <Sparkles className="text-[10px] w-3 h-3" />
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Flow */}
          {hasMessages && (
            <div className="messages-container">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onCopy={handleCopy}
                    onSpeak={handleSpeak}
                    isSpeaking={speakingMessageId === msg.id}
                    onPreviewImage={(url) => setPreviewImageUrl(url)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Scroll to bottom button */}
          <ScrollToBottomButton
            visible={showScrollBtn}
            onClick={() => scrollToBottom()}
          />
        </div>

        {/* Bottom Input Section (Active when conversation has messages) */}
        {hasMessages && (
          <div className="w-full px-6 mb-4 flex flex-col items-center relative z-20">
            {/* RADIANT INPUT COMPONENT */}
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 mx-auto">
              <RadiantPromptInput 
                value={inputValue}
                onChange={handleInputChange}
                onSubmit={() => sendMessage()}
                disabled={isStreaming}
                placeholder={getPlaceholder()}
                designMode={designMode}
                setDesignMode={setDesignMode}
                webSearchEnabled={webSearchEnabled}
                setWebSearchEnabled={setWebSearchEnabled}
                isListening={isListening}
                toggleSpeechRecognition={toggleSpeechRecognition}
                setIsVoiceAssistantOpen={setIsVoiceAssistantOpen}
                attachments={attachments}
                onAttachmentClick={() => fileInputRef.current?.click()}
                onRemoveAttachment={removeAttachment}
                onPreviewAttachment={(url) => setPreviewImageUrl(url)}
              />
            </div>
            
            <p className="w-full text-zinc-500 text-[11px] text-center mt-3">
              Lexa AI can make mistakes. Verify critical code and documents.
            </p>
          </div>
        )}

        {/* Floating Help Button */}
        <button 
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer z-50 shadow-2xl"
          style={{ background: 'rgba(10, 10, 12, 0.8)', backdropFilter: 'blur(10px)' }}
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

      </main>
    </div>
  );
}

/* ─── Export with Error Boundary ─── */
export default function Index() {
  return (
    <ErrorBoundary FallbackComponent={ChatFallback}>
      <IndexContent />
    </ErrorBoundary>
  );
}
