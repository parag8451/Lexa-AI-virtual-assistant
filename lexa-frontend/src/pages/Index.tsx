import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ArrowDown, ArrowUp, Copy, Check, ThumbsUp, ThumbsDown,
  Plus, Settings, Sparkles, ChevronDown, Mic, MicOff, Lock, Unlock,
  Volume2, VolumeX, Download, Trash2, Globe, CheckCircle2,
  Cpu, Zap, Wand2, Smartphone, Code2, Paperclip, MessageSquare,
  History, Search, Edit2, X, Clock, PanelLeftClose, Camera, FileText,
  FileCode, Eye, Radio, ExternalLink
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import "@/components/chat/CustomChatUI.css";
import StitchWaveBackground from "@/components/chat/StitchWaveBackground";
import { HeroRotatingTitle } from "@/components/chat/HeroRotatingTitle";
import { SafeMarkdown } from "@/components/chat/SafeMarkdown";
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
          <svg className="lexa-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`starGrad-${message.id}`} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill={`url(#starGrad-${message.id})`} />
            <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill={`url(#starGrad-${message.id})`} opacity="0.6" />
          </svg>
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

/* ─── Attachment Preview Tray Component ─── */
function AttachmentTray({
  attachments,
  onRemove,
  onPreview,
}: {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  onPreview: (url: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2.5 p-2 bg-[#12141e]/90 border border-white/10 rounded-2xl">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="relative flex items-center gap-2 p-1.5 pr-2.5 bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 rounded-xl text-xs text-zinc-200 transition-colors group"
        >
          {att.isImage ? (
            <img
              src={att.dataUrl}
              alt={att.name}
              onClick={() => onPreview(att.dataUrl)}
              className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
            />
          ) : att.isPdf ? (
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FileText className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
          )}

          <div className="flex flex-col min-w-0 pr-1">
            <span className="truncate max-w-[120px] font-medium">{att.name}</span>
            <span className="text-[10px] text-zinc-400">{formatFileSize(att.size)}</span>
          </div>

          <button
            type="button"
            onClick={() => onRemove(att.id)}
            className="w-4 h-4 rounded-full bg-white/10 hover:bg-rose-500/30 hover:text-rose-400 flex items-center justify-center text-zinc-400 transition-colors"
            title="Remove attachment"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Chat Content ─── */
function IndexContent() {
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
    <div className="custom-chat-wrapper bg-[#090a0e] relative flex overflow-hidden">
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

      {/* ─── Sidebar ─── */}
      <aside className="sidebar border-white/5 bg-[#0d0e14]/90 backdrop-blur-xl shrink-0" aria-label="Sidebar">
        {/* Leftmost Top Brand Logo */}
        <div
          className="sidebar-logo cursor-pointer hover:opacity-85 transition-opacity"
          onClick={handleNewChat}
          title="Lexa AI - New Chat"
        >
          <svg className="lexa-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sidebarStar" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#sidebarStar)" />
            <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill="url(#sidebarStar)" opacity="0.6" />
          </svg>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="sidebar-btn active hover:bg-white/10 transition-all active:scale-95"
              onClick={handleNewChat}
              aria-label="New chat"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">New Chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="sidebar-btn hover:bg-white/10 text-zinc-400 hover:text-cyan-400 transition-all active:scale-95"
              aria-label="Vision Scanner"
            >
              <Camera className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Camera Scanner (OCR & Vision)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="sidebar-btn hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition-all active:scale-95"
              aria-label="Live Voice Assistant"
            >
              <Radio className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Real-Time Talking Assistant</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsPrivateConversation((p) => !p)}
              className={`sidebar-btn hover:bg-white/10 transition-all active:scale-95 ${
                isPrivateConversation ? "bg-white/10 text-white" : "text-zinc-400"
              }`}
              aria-label="Toggle private conversation"
            >
              {isPrivateConversation ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isPrivateConversation ? "Private: conversations won't be saved" : "Public: conversations are saved"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`sidebar-btn hover:bg-white/10 transition-all active:scale-95 ${
                isHistoryOpen ? "bg-white/15 text-white" : "text-zinc-400"
              }`}
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              aria-label="Chat History"
            >
              <History className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Chat History ({conversations.length})</TooltipContent>
        </Tooltip>

        {hasMessages && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="sidebar-btn hover:bg-white/10 transition-all active:scale-95"
                onClick={handleExport}
                aria-label="Export chat"
              >
                <Download className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Export Chat</TooltipContent>
          </Tooltip>
        )}

        <div className="sidebar-bottom mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="settings-btn hover:bg-white/10 p-2.5 rounded-xl transition-all active:scale-95"
                onClick={() => navigate("/settings")}
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings & API Keys</TooltipContent>
          </Tooltip>
        </div>
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
      <main className="main relative overflow-hidden bg-transparent w-full h-full" role="main">
        {/* Full-Screen Smooth Dynamic Wave Background */}
        <StitchWaveBackground speed={0.75} intensity={0.75} />

        {/* Upper-Half Soft Translucent Black Blend */}
        <div
          className="fixed inset-x-0 top-0 h-[48vh] pointer-events-none z-10"
          style={{
            background: "linear-gradient(to bottom, rgba(9, 10, 14, 0.40) 0%, rgba(9, 10, 14, 0.15) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

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

        {/* ── Top Header with Stable, Prominent Leftmost Branding ── */}
        <header className="header flex items-center justify-between px-6 py-4 relative z-20">
          {/* Permanent & Stable LEXA AI Brand Anchor */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={handleNewChat}
            title="Lexa AI Assistant - Home"
          >
            {/* Emblem */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center backdrop-blur-md shadow-sm group-hover:border-cyan-400/50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="headerStar" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#headerStar)" />
                <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill="url(#headerStar)" opacity="0.6" />
              </svg>
            </div>

            {/* Stable Branding Text */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                LEXA AI
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                2.0
              </span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Live Voice Assistant Launch Button */}
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Live Talking AI</span>
            </button>

            {/* Camera Scanner Button */}
            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Scan / OCR</span>
            </button>

            {/* Model selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 bg-[#161824]/90 hover:bg-[#202334] border border-white/10 text-zinc-200 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <currentModelInfo.icon className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{currentModelInfo.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
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

            {/* Web Search toggle */}
            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 cursor-pointer ${
                webSearchEnabled
                  ? "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30 shadow-sm"
                  : "bg-white/[0.06] text-zinc-400 border-white/10 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search</span>
            </button>

            {/* Top Action Button */}
            {hasMessages ? (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-200 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div
          className={`chat-area relative z-10 ${hasMessages ? "has-messages" : "flex flex-col items-center justify-center"}`}
          id="chatArea"
          ref={chatAreaRef}
          onScroll={handleScroll}
          aria-live="polite"
        >
          {/* Welcome Hero & Floating Input Card */}
          <AnimatePresence mode="wait">
            {!hasMessages && (
              <motion.div
                key="welcome-hero"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
                className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center text-center my-auto"
              >
                {/* Hero Rotating Tagline Carousel */}
                <HeroRotatingTitle pauseDurationMs={10000} typingSpeedMs={50} />

                {/* Hero Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="text-sm sm:text-base text-zinc-400 max-w-xl mb-8 font-normal leading-relaxed"
                >
                  Your multimodal AI assistant for vision OCR, documents, code, creativity, and voice
                </motion.p>

                {/* ── Central Floating Realistic Card ── */}
                <div
                  className={`w-full max-w-2xl rounded-3xl p-4 sm:p-5 text-left transition-all duration-200 ${
                    inputFocused
                      ? "border-cyan-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_0_1px_rgba(56,189,248,0.4)]"
                      : "border-white/12 hover:border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                  }`}
                  style={{
                    background: "rgba(18, 20, 32, 0.75)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                >
                  {/* Attachment Tray */}
                  <AttachmentTray
                    attachments={attachments}
                    onRemove={removeAttachment}
                    onPreview={(url) => setPreviewImageUrl(url)}
                  />

                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeydown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={getPlaceholder()}
                    className="w-full bg-transparent text-white placeholder-zinc-500 text-base sm:text-lg resize-none outline-none focus:outline-none font-normal"
                    disabled={isStreaming}
                  />

                  {/* Card Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                    {/* Left side: Attachments + Camera + Mode Switcher */}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
                            aria-label="Upload File / Document / PDF"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Attach image, PDF, or code</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setIsCameraModalOpen(true)}
                            className="w-8 h-8 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
                            aria-label="Camera OCR Scanner"
                          >
                            <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Camera scanner (OCR & docs)</TooltipContent>
                      </Tooltip>

                      {/* Segmented Mode Switcher */}
                      <div className="hidden sm:flex items-center p-0.5 rounded-full bg-[#10121a] border border-white/10 text-xs shadow-inner">
                        <button
                          type="button"
                          onClick={() => setDesignMode("assistant")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all active:scale-95 cursor-pointer ${
                            designMode === "assistant"
                              ? "bg-[#242738] text-white shadow-sm border border-white/15"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                          <span>Assistant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("code")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all active:scale-95 cursor-pointer ${
                            designMode === "code"
                              ? "bg-[#242738] text-white shadow-sm border border-white/15"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Code2 className="w-3 h-3 text-[#818CF8]" />
                          <span>Code</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("web")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all active:scale-95 cursor-pointer ${
                            designMode === "web"
                              ? "bg-[#242738] text-white shadow-sm border border-white/15"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Globe className="w-3 h-3 text-[#34D399]" />
                          <span>Web</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("mobile")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all active:scale-95 cursor-pointer ${
                            designMode === "mobile"
                              ? "bg-[#242738] text-white shadow-sm border border-white/15"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Smartphone className="w-3 h-3 text-[#F472B6]" />
                          <span>App</span>
                        </button>
                      </div>
                    </div>

                    {/* Right side: Search Toggle, Live Voice, Mic, and Send */}
                    <div className="flex items-center gap-2">
                      {/* Web search toggle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${
                              webSearchEnabled
                                ? "text-[#38BDF8] bg-[#38BDF8]/20 border-[#38BDF8]/40 shadow-sm"
                                : "text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border-white/10"
                            }`}
                            aria-label="Toggle Web Search"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {webSearchEnabled ? "Web Search Enabled" : "Enable Web Search"}
                        </TooltipContent>
                      </Tooltip>

                      {/* Live Voice Assistant Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setIsVoiceAssistantOpen(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-400"
                            aria-label="Real-time Voice Chat"
                          >
                            <Radio className="w-4 h-4 text-emerald-400" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Real-Time Talking Assistant</TooltipContent>
                      </Tooltip>

                      {/* Voice / Mic */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${
                              isListening
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm"
                                : "bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-zinc-300 hover:text-white"
                            }`}
                            aria-label="Voice input"
                          >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {isListening ? "Stop listening" : "Voice Prompt"}
                        </TooltipContent>
                      </Tooltip>

                      {/* Realistic Send / Arrow Button */}
                      <button
                        type="button"
                        disabled={(!inputValue.trim() && attachments.length === 0) || isStreaming}
                        onClick={() => sendMessage()}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                          inputValue.trim() || attachments.length > 0
                            ? "bg-white text-zinc-950 font-bold hover:bg-zinc-100 shadow-md cursor-pointer border border-white/20"
                            : "bg-white/[0.07] text-zinc-600 border border-white/5 cursor-not-allowed"
                        }`}
                        title="Send to Lexa AI"
                        aria-label="Send to Lexa AI"
                      >
                        <ArrowUp className="w-4 h-4 font-bold" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Suggestion Chips Row ── */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mt-4"
                >
                  {suggestionsMap[designMode].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(s.text)}
                      disabled={isStreaming}
                      className="flex items-center gap-2 bg-[#141724]/80 hover:bg-[#1f2235] border border-white/10 hover:border-white/20 rounded-full px-3.5 py-1.5 text-xs text-zinc-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span className="truncate max-w-[280px] sm:max-w-none">{s.text}</span>
                    </button>
                  ))}
                </motion.div>
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
          <div className="input-section relative z-20">
            <div className={`input-glow-wrapper ${inputFocused ? "focused" : ""}`}>
              {/* Attachment Tray above bottom input */}
              <AttachmentTray
                attachments={attachments}
                onRemove={removeAttachment}
                onPreview={(url) => setPreviewImageUrl(url)}
              />

              <div className="input-wrapper">
                {/* Left Action Buttons in bottom bar */}
                <div className="flex items-center gap-1 pl-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
                        title="Attach file / document"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Attach file</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsCameraModalOpen(true)}
                        className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors active:scale-95"
                        title="Camera Scanner"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Camera scanner (OCR & docs)</TooltipContent>
                  </Tooltip>
                </div>

                <textarea
                  ref={inputRef}
                  className="chat-input placeholder-zinc-500 text-white"
                  placeholder={
                    isListening
                      ? "Listening... speak now..."
                      : isStreaming
                      ? "Lexa is thinking..."
                      : attachments.length > 0
                      ? `Ask about ${attachments.length} attached file(s)...`
                      : "Ask Lexa AI anything..."
                  }
                  rows={1}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeydown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  disabled={isStreaming}
                  aria-label="Chat input message"
                />

                <div className="input-right flex items-center gap-1 pr-1">
                  {/* Live Talking Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsVoiceAssistantOpen(true)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors active:scale-95"
                        title="Live Voice Assistant"
                      >
                        <Radio className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Real-Time Talking Assistant</TooltipContent>
                  </Tooltip>

                  <AnimatePresence mode="wait">
                    {inputValue.trim() || attachments.length > 0 ? (
                      <button
                        key="send"
                        className="send-btn visible"
                        onClick={() => sendMessage()}
                        disabled={isStreaming}
                        title="Send message"
                        aria-label="Send message"
                      >
                        <ArrowUp className="w-4 h-4 font-bold" />
                      </button>
                    ) : (
                      <button
                        key="mic"
                        onClick={toggleSpeechRecognition}
                        className={`mic-btn ${
                          isListening ? "text-rose-400 bg-rose-500/20 border-rose-500/30" : ""
                        }`}
                        title={isListening ? "Stop listening" : "Voice input"}
                        aria-label="Voice input"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <p className="disclaimer text-zinc-500 text-[11px] text-center mt-2">
              Lexa AI can make mistakes. Verify critical code and documents.
            </p>
          </div>
        )}
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
