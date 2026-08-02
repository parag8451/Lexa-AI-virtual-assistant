import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ArrowDown, ArrowUp, Copy, Check, ThumbsUp, ThumbsDown,
  Plus, Settings, Sparkles, ChevronDown, Mic, MicOff,
  Volume2, VolumeX, Download, Trash2, Globe, CheckCircle2,
  Cpu, Zap, Wand2, Smartphone, Code2, Paperclip, MessageSquare,
  History, Search, Edit2, X, Clock, PanelLeftClose, CheckSquare
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import "@/components/chat/CustomChatUI.css";
import StitchWaveBackground from "@/components/chat/StitchWaveBackground";
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
import { CustomCursor } from "@/components/ui/CustomCursor";

/* ─── Types ─── */
interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
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
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", badge: "Fast", desc: "Ultra-fast multimodal reasoning", icon: Zap },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", badge: "Pro", desc: "Complex problem solving & deep logic", icon: Sparkles },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", badge: "Next-Gen", desc: "Next generation speed and accuracy", icon: Cpu },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", badge: "Smart", desc: "Superior coding & nuanced writing", icon: Wand2 },
];

/* ─── Helpers ─── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-red-400/80 max-w-md text-sm">{error.message}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetErrorBoundary}
          className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-shadow"
        >
          Try Again
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Message Bubble Component ─── */
function MessageBubble({
  message,
  onCopy,
  onSpeak,
  isSpeaking
}: {
  message: ChatMessage;
  onCopy: (text: string) => void;
  onSpeak?: (text: string, id: string) => void;
  isSpeaking?: boolean;
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
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`message ${message.role === "user" ? "user" : "ai"}`}
    >
      {message.role === "ai" && (
        <div className="avatar ai shrink-0 mt-0.5">
          <svg className="lexa-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`starGrad-${message.id}`} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4285f4" />
                <stop offset="50%" stopColor="#9b59b6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill={`url(#starGrad-${message.id})`} />
            <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill={`url(#starGrad-${message.id})`} opacity="0.6" />
          </svg>
        </div>
      )}

      <div className="message-body flex-1 min-w-0">
        <div className="bubble text-sm sm:text-base leading-relaxed">
          {message.role === "user" ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="ai-markdown prose prose-invert max-w-none">
              <SafeMarkdown content={message.content} />
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#4D90FE] animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Message Actions */}
        {message.role === "ai" && !message.isStreaming && (
          <div className="message-actions flex items-center gap-1 mt-2 text-zinc-400">
            <button
              onClick={handleCopy}
              className="action-btn hover:text-white p-1 rounded-md transition-colors"
              title={copied ? "Copied" : "Copy response"}
              aria-label="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {onSpeak && (
              <button
                onClick={() => onSpeak(message.content, message.id)}
                className={`action-btn p-1 rounded-md transition-colors ${isSpeaking ? "text-[#4D90FE] bg-[#4D90FE]/10" : "hover:text-white"}`}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
                aria-label="Read aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={() => setReaction(reaction === "up" ? null : "up")}
              className={`action-btn p-1 rounded-md transition-colors ${reaction === "up" ? "text-emerald-400" : "hover:text-white"}`}
              title="Good response"
              aria-label="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setReaction(reaction === "down" ? null : "down")}
              className={`action-btn p-1 rounded-md transition-colors ${reaction === "down" ? "text-rose-400" : "hover:text-white"}`}
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
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
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
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="fixed bottom-24 right-8 z-30 p-2.5 rounded-full bg-[#1c1d25] border border-white/10 text-white shadow-2xl hover:bg-[#252733] transition-colors"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-[#4D90FE]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Chat Content ─── */
function IndexContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<"assistant" | "code" | "web" | "mobile">("assistant");
  const [pageReady, setPageReady] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

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
            model: d.model || "gemini-1.5-flash",
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

  /* Cinematic page fade-in + Typewriter effect */
  const heroTitle = "Where Intelligence Meets Conversation";

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPageReady(true), 300);
    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    if (!pageReady || hasMessages) return;
    setTypedText("");
    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      setTypedText(heroTitle.slice(0, i));
      if (i >= heroTitle.length) {
        clearInterval(typeInterval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 55);
    return () => clearInterval(typeInterval);
  }, [pageReady, hasMessages]);

  useEffect(() => {
    if (!showCursor) return;
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
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

  /* Handle File Attachment */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File attached",
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
      setInputValue((prev) => (prev ? `${prev}\n[Attached: ${file.name}]` : `[Attached: ${file.name}] `));
      if (inputRef.current) {
        inputRef.current.focus();
      }
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
    setSelectedModel(conv.model || "gemini-1.5-flash");
    setMessages(
      conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
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
      toast({
        title: "History cleared",
        description: "All past conversations have been deleted.",
      });
    }
  };

  /* Send message */
  const sendMessage = async (overrideContent?: string) => {
    const content = (overrideContent ?? inputValue).trim();
    if (!content || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setIsStreaming(true);

    let activeConvId = currentConversationId;
    let currentTitle = "";
    if (!activeConvId) {
      activeConvId = generateId();
      setCurrentConversationId(activeConvId);
      currentTitle = content.length > 38 ? content.slice(0, 38) + "..." : content;
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
          timestamp: m.timestamp.toISOString(),
        })),
      };
      persistConversations([newConv, ...conversations]);
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
                timestamp: m.timestamp.toISOString(),
              })),
            }
          : c
      );
      persistConversations(updated);
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

      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
              content: m.content,
            })),
            { role: "user" as const, content },
          ],
          model: selectedModel,
          webSearch: webSearchEnabled,
          mode: designMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
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
                if (parsed.type === "text_delta" && parsed.text) {
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
              } catch (e) {
                // Ignore incomplete SSE chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("Backend chat API error, displaying fallback:", err);
      accumulatedContent = `I received your request: "${content}"\n\nI am currently running in local mode with model **${currentModelInfo.name}**. Let me know how else I can assist you!`;
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

      // Save complete conversation history with AI response
      const allFinalMessages = [...nextMessages, finalAiMsg];
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
      { emoji: "⚡", text: "Explain quantum computing algorithms in plain English" },
      { emoji: "💡", text: "Summarize key architecture trends in modern distributed systems" },
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
    switch (designMode) {
      case "code":
        return "Describe an algorithm, component, or full-stack feature...";
      case "web":
        return "What web application or dashboard shall we build?";
      case "mobile":
        return "What native mobile app or screen shall we design?";
      default:
        return "Ask Lexa to analyze, code, brainstorm, or build anything...";
    }
  };

  return (
    <div className="custom-chat-wrapper bg-[#090a0e] relative flex overflow-hidden">
      <CustomCursor />

      {/* Hidden File Input for Attachment */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ─── Sidebar ─── */}
      <aside className="sidebar border-white/5 bg-[#0d0e14]/90 backdrop-blur-xl shrink-0" aria-label="Sidebar">
        <div className="sidebar-logo cursor-pointer" onClick={handleNewChat} title="Lexa AI">
          <svg className="lexa-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#g1)" />
            <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill="url(#g1)" opacity="0.6" />
          </svg>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="sidebar-btn active hover:bg-white/10 transition-colors"
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
              className={`sidebar-btn hover:bg-white/10 transition-colors ${isHistoryOpen ? "bg-white/15 text-white" : "text-zinc-400"}`}
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
                className="sidebar-btn hover:bg-white/10 transition-colors"
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
                className="settings-btn hover:bg-white/10 p-2.5 rounded-xl transition-colors"
                onClick={() => navigate("/settings")}
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
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
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
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
                  className="w-full bg-[#161822] text-xs text-white pl-8 pr-7 py-2 rounded-xl border border-white/5 focus:border-[#38bdf8]/50 focus:outline-none placeholder:text-zinc-500"
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
        {/* Full-Screen 8K Smooth Dynamic Wave Background */}
        <StitchWaveBackground speed={0.7} intensity={0.55} />

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

        {/* ── Top Header ── */}
        <header className="header flex items-center justify-between px-6 py-4 relative z-20">
          {/* Brand Logo & Pill */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleNewChat}>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Lexa
            </span>
            <span className="text-[10px] font-bold tracking-wider text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase">
              2.0 PRO
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Model selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-[#181a24]/80 hover:bg-[#202230] border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all shadow-sm cursor-pointer"
                >
                  <currentModelInfo.icon className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{currentModelInfo.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </motion.button>
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
                      className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-[#38BDF8]/15 text-white" : "hover:bg-white/10"
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
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${webSearchEnabled
                  ? "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30 shadow-sm"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search</span>
            </motion.button>

            {/* Top Action Button */}
            {hasMessages ? (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md cursor-pointer"
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
                className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center text-center my-auto"
              >
                {/* Hero Title — Typewriter Animation */}
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-3 leading-[1.12] min-h-[2.4em]">
                  <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    {typedText}
                  </span>
                  <span
                    className={`inline-block w-[3px] h-[0.85em] bg-[#38BDF8] ml-1.5 align-middle rounded-full shadow-[0_0_10px_#38BDF8] transition-opacity duration-150 ${
                      showCursor ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </h1>

                {/* Hero Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: typedText.length > 20 ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-sm sm:text-base text-zinc-400 max-w-xl mb-8 font-normal leading-relaxed"
                >
                  Your AI-powered assistant for code, creativity, and conversation
                </motion.p>

                {/* ── Central Floating Glassmorphic Card ── */}
                <div
                  className={`w-full max-w-2xl rounded-3xl p-4 sm:p-5 text-left transition-all duration-300 ${
                    inputFocused
                      ? "border-cyan-400/40 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_25px_rgba(56,189,248,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                      : "border-white/15 hover:border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.18)]"
                  }`}
                  style={{
                    background: "rgba(18, 22, 36, 0.45)",
                    backdropFilter: "blur(28px) saturate(190%)",
                    WebkitBackdropFilter: "blur(28px) saturate(190%)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                >
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeydown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={getPlaceholder()}
                    className="w-full bg-transparent text-white placeholder-zinc-400 text-base sm:text-lg resize-none outline-none focus:outline-none font-normal"
                    disabled={isStreaming}
                  />

                  {/* Card Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
                    {/* Left side: Context + Mode Switcher */}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-sm"
                            aria-label="Add Context"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Attach file or snippet</TooltipContent>
                      </Tooltip>

                      {/* Segmented Mode Switcher */}
                      <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs shadow-inner">
                        <button
                          type="button"
                          onClick={() => setDesignMode("assistant")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            designMode === "assistant"
                              ? "bg-white/15 text-white shadow-sm border border-white/15 backdrop-blur-md"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                          <span className="hidden sm:inline">Assistant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("code")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            designMode === "code"
                              ? "bg-white/15 text-white shadow-sm border border-white/15 backdrop-blur-md"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Code2 className="w-3 h-3 text-[#818CF8]" />
                          <span>Code</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("web")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            designMode === "web"
                              ? "bg-white/15 text-white shadow-sm border border-white/15 backdrop-blur-md"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Globe className="w-3 h-3 text-[#34D399]" />
                          <span>Web</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("mobile")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            designMode === "mobile"
                              ? "bg-white/15 text-white shadow-sm border border-white/15 backdrop-blur-md"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Smartphone className="w-3 h-3 text-[#F472B6]" />
                          <span>App</span>
                        </button>
                      </div>
                    </div>

                    {/* Right side: Search Toggle, Model, Mic, and Send */}
                    <div className="flex items-center gap-2">
                      {/* Web search icon toggle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border ${
                              webSearchEnabled
                                ? "text-[#38BDF8] bg-[#38BDF8]/20 border-[#38BDF8]/40 shadow-sm"
                                : "text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.14] border-white/10"
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

                      {/* Model pill selector inside card */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-xs text-zinc-200 font-medium backdrop-blur-md transition-all cursor-pointer shadow-sm">
                            <currentModelInfo.icon className="w-3.5 h-3.5 text-[#38BDF8]" />
                            <span>{currentModelInfo.name.replace("Gemini ", "").replace("Claude ", "")}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#14151e]/95 backdrop-blur-xl border-white/10 text-white p-1 shadow-2xl rounded-2xl z-50">
                          {AVAILABLE_MODELS.map((model) => (
                            <DropdownMenuItem
                              key={model.id}
                              onClick={() => setSelectedModel(model.id)}
                              className="flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer hover:bg-white/10"
                            >
                              <span>{model.name}</span>
                              {selectedModel === model.id && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Voice / Mic */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border ${
                              isListening
                                ? "bg-red-500/25 text-red-400 border-red-500/40 animate-pulse shadow-sm"
                                : "bg-white/[0.06] hover:bg-white/[0.14] border-white/10 text-zinc-300 hover:text-white"
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

                      {/* Send / Generate Arrow Button */}
                      <button
                        type="button"
                        disabled={!inputValue.trim() || isStreaming}
                        onClick={() => sendMessage()}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          inputValue.trim()
                            ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/20 cursor-pointer"
                            : "bg-white/10 text-zinc-600 border border-white/5 cursor-not-allowed"
                        }`}
                        title="Send to Lexa"
                        aria-label="Send to Lexa"
                      >
                        <ArrowUp className="w-4 h-4 font-bold" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Suggestion Chips Row ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mt-4"
                >
                  {suggestionsMap[designMode].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(s.text)}
                      disabled={isStreaming}
                      className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 rounded-full px-4 py-1.5 text-xs text-zinc-200 backdrop-blur-xl transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] group cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
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
              <div
                className="input-wrapper"
                style={{
                  background: "rgba(16, 19, 34, 0.50)",
                  backdropFilter: "blur(28px) saturate(190%)",
                  WebkitBackdropFilter: "blur(28px) saturate(190%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.02)",
                }}
              >
                <textarea
                  ref={inputRef}
                  className="chat-input placeholder-zinc-400 text-white"
                  placeholder={isListening ? "Listening... speak now..." : isStreaming ? "Lexa is thinking..." : "Ask Lexa anything..."}
                  rows={1}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeydown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  disabled={isStreaming}
                  aria-label="Chat input message"
                />
                <div className="input-right">
                  <AnimatePresence mode="wait">
                    {inputValue.trim() ? (
                      <motion.button
                        key="send"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        className="send-btn visible bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/20"
                        onClick={() => sendMessage()}
                        disabled={isStreaming}
                        title="Send message"
                        aria-label="Send message"
                      >
                        <ArrowUp className="w-4 h-4 text-black font-bold" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="mic"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleSpeechRecognition}
                        className={`mic-btn ${isListening ? "text-red-400 animate-pulse bg-red-500/25 border border-red-500/40" : "text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.14] border border-white/10"}`}
                        title={isListening ? "Stop listening" : "Voice input"}
                        aria-label="Voice input"
                      >
                        {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <p className="disclaimer text-zinc-500 text-[11px] text-center mt-2">
              Lexa AI can make mistakes. Verify critical code and information.
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
