import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, ArrowDown, ArrowUp, Copy, Check, ThumbsUp, ThumbsDown,
  Plus, Settings, Sparkles, ChevronDown, Mic, MicOff,
  Volume2, VolumeX, Download, Trash2, Globe, CheckCircle2,
  Cpu, Zap, Shield, Wand2, Smartphone
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import "@/components/chat/CustomChatUI.css";
import StitchWaveBackground from "@/components/chat/StitchWaveBackground";
import { SafeMarkdown } from "@/components/chat/SafeMarkdown";
import { useToast } from "@/hooks/use-toast";
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

const AVAILABLE_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", badge: "Fast", desc: "Ultra-fast multimodal reasoning", icon: Zap },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", badge: "Pro", desc: "Complex problem solving & deep logic", icon: Sparkles },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", badge: "Next-Gen", desc: "Next generation speed and accuracy", icon: Cpu },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", badge: "Intelligence", desc: "Superior coding & nuanced writing", icon: Wand2 },
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
          className="mt-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-shadow"
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
      {/* Avatar */}
      {message.role === "ai" ? (
        <div className="msg-avatar ai">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <defs>
              <linearGradient id={`mg-${message.id}`} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4285f4" />
                <stop offset="100%" stopColor="#9b59b6" />
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill={`url(#mg-${message.id})`} />
          </svg>
        </div>
      ) : (
        <div className="msg-avatar user">P</div>
      )}

      {/* Content */}
      <div className="max-w-full overflow-hidden">
        <div className="msg-bubble" aria-live="polite">
          {message.isStreaming && !message.content ? (
            /* Shimmer skeleton loader */
            <div className="shimmer-container">
              <div className="shimmer-line shimmer-line-1" />
              <div className="shimmer-line shimmer-line-2" />
              <div className="shimmer-line shimmer-line-3" />
            </div>
          ) : message.role === "ai" ? (
            <SafeMarkdown content={message.content} />
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {/* Actions (AI messages only, not while streaming) */}
        {message.role === "ai" && !message.isStreaming && message.content && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="msg-actions"
          >
            <button
              className="msg-action-btn"
              title={copied ? "Copied!" : "Copy response"}
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {onSpeak && (
              <button
                className={`msg-action-btn ${isSpeaking ? "active-reaction text-primary" : ""}`}
                title={isSpeaking ? "Stop speaking" : "Listen to response"}
                onClick={() => onSpeak(message.content, message.id)}
                aria-label="Listen to message"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            <button
              className={`msg-action-btn ${reaction === "up" ? "active-reaction" : ""}`}
              title="Good response"
              onClick={() => setReaction(reaction === "up" ? null : "up")}
              aria-label="Good response"
            >
              <ThumbsUp className={`w-4 h-4 ${reaction === "up" ? "text-green-400" : ""}`} />
            </button>
            <button
              className={`msg-action-btn ${reaction === "down" ? "active-reaction" : ""}`}
              title="Bad response"
              onClick={() => setReaction(reaction === "down" ? null : "down")}
              aria-label="Bad response"
            >
              <ThumbsDown className={`w-4 h-4 ${reaction === "down" ? "text-red-400" : ""}`} />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Scroll to Bottom Button ─── */
function ScrollToBottomButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="scroll-to-bottom-btn"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─── Suggestion Chip ─── */
function SuggestionChip({ emoji, text, onClick, disabled }: { emoji: string; text: string; onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm rounded-full px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-white/70 dark:hover:bg-zinc-800/80 transition-all flex items-center gap-2 group cursor-pointer"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-sm">{emoji}</span>
      <span>{text}</span>
    </motion.button>
  );
}

/* ─── Main Chat Component ─── */
function IndexContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<"app" | "web">("app");

  const recognitionRef = useRef<any>(null);

  const hasMessages = messages.length > 0;
  const currentModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  /* Auto-scroll */
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  /* Detect scroll position for "scroll to bottom" button */
  const handleScroll = useCallback(() => {
    if (!chatAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBtn(!isNearBottom && hasMessages);
  }, [hasMessages]);

  /* Auto-resize textarea */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
  };

  /* Speech-to-text recognition */
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Voice input not supported",
        description: "Your browser does not support Web Speech Recognition.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak into your microphone.",
        });
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(prev => {
          const base = prev.trim();
          return base ? `${base} ${transcript}` : transcript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  /* Text-to-speech */
  const handleSpeak = (text: string, messageId: string) => {
    if (!("speechSynthesis" in window)) {
      toast({
        variant: "destructive",
        title: "Text-to-speech not supported",
        description: "Your browser does not support Speech Synthesis.",
      });
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[`*#_~\[\]]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  /* Send message */
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || inputValue).trim();
    if (!messageText || isStreaming) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    const aiMsg: ChatMessage = {
      id: generateId(),
      role: "ai",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputValue("");
    setIsStreaming(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Build message history for API
    const history = [...messages, userMsg].map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          model: selectedModel,
          webSearch: webSearchEnabled,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text_delta") {
                fullText += data.text;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMsg.id
                      ? { ...m, content: fullText, isStreaming: true }
                      : m
                  )
                );
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              // Ignore chunk parse errors
            }
          }
        }
      }

      // Mark streaming complete
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsg.id ? { ...m, isStreaming: false } : m
        )
      );
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsg.id
            ? {
                ...m,
                content: `Lexa Error: ${error.message || "Failed to connect to assistant backend."}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [inputValue, isStreaming, isListening, messages, selectedModel, webSearchEnabled]);

  /* Keydown handler */
  const handleKeydown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* Copy to clipboard */
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  }, [toast]);

  /* Export chat */
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const chatText = messages
      .map(m => `### ${m.role === "user" ? "User" : "Lexa AI"} (${m.timestamp.toLocaleTimeString()})\n\n${m.content}\n\n---\n`)
      .join("\n");
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

  /* New chat */
  const handleNewChat = () => {
    if (isStreaming) return;
    if (speakingMessageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setMessages([]);
  };

  /* Suggestions */
  const appSuggestions = [
    { emoji: "✨", text: "Browse page for a mobile app that sells plants" },
    { emoji: "✨", text: "A mobile scavenger hunt app for city exploration" },
    { emoji: "✨", text: "Mobile friendly home for a marketplace" },
  ];
  const webSuggestions = [
    { emoji: "✨", text: "AI-driven analytics dashboard for real-time metrics" },
    { emoji: "✨", text: "Developer documentation portal with interactive preview" },
    { emoji: "✨", text: "E-commerce checkout flow with micro-interactions" },
  ];

  return (
    <div className="custom-chat-wrapper bg-[#0c0d12]">
      <CustomCursor />
      {/* ─── Sidebar ─── */}
      <aside className="sidebar border-white/5 bg-[#0c0d12]/90 backdrop-blur-md" aria-label="Sidebar">
        <div className="sidebar-logo">
          <svg className="lexa-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4285f4" />
                <stop offset="33%" stopColor="#9b59b6" />
                <stop offset="66%" stopColor="#ea4335" />
                <stop offset="100%" stopColor="#fbbc04" />
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#g1)" />
            <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill="url(#g1)" opacity="0.6" />
          </svg>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="sidebar-btn active"
              onClick={handleNewChat}
              aria-label="New design thread"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">New Project</TooltipContent>
        </Tooltip>

        <div className="sidebar-bottom mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="settings-btn"
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

      {/* ─── Main ─── */}
      <main className="main relative overflow-hidden bg-transparent" role="main">
        {/* Stitch Moving Curved Wave + Dot Grid Background */}
        <StitchWaveBackground speed={0.85} intensity={1.15} />

        {/* ── Stitch Header ── */}
        <header className="header flex items-center justify-between px-6 py-4 relative z-20">
          {/* Brand Logo & Beta Pill */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Stitch
            </span>
            <span className="text-[10px] font-bold tracking-wider text-zinc-300 border border-white/20 bg-white/5 px-2 py-0.5 rounded-full uppercase">
              BETA
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
                  className="flex items-center gap-2 bg-[#1c1d25]/80 hover:bg-[#252733] border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all shadow-sm"
                >
                  <currentModelInfo.icon className="w-3.5 h-3.5 text-[#4D90FE]" />
                  <span>{currentModelInfo.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-[#181920]/95 backdrop-blur-xl border border-white/10 text-white p-2 shadow-2xl z-50 rounded-2xl">
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
                        isSelected ? "bg-[#4D90FE]/15 text-white" : "hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#4D90FE]" : "text-zinc-400"}`} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{model.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 font-medium">
                            {model.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 truncate">{model.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4D90FE] shrink-0 mt-0.5" />}
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
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                webSearchEnabled
                  ? "bg-[#4D90FE]/15 text-[#4D90FE] border-[#4D90FE]/30 shadow-sm"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search</span>
            </motion.button>

            {/* Top Action Pill Button */}
            {hasMessages ? (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                Try now
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
          {/* Stitch Hero & Centered Input Card */}
          <AnimatePresence mode="wait">
            {!hasMessages && (
              <motion.div
                key="stitch-hero"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
                className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center text-center my-auto"
              >
                {/* Hero Title */}
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-3 leading-[1.1]">
                  Design at the <br className="hidden sm:inline" />
                  speed of AI
                </h1>

                {/* Hero Subtitle */}
                <p className="text-sm sm:text-base text-zinc-400 max-w-xl mb-8 font-normal leading-relaxed">
                  Transform ideas into UI designs for mobile and web applications
                </p>

                {/* ── Stitch Floating Input Card ── */}
                <div className="w-full max-w-2xl bg-[#1c1d25]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl text-left transition-all">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeydown}
                    placeholder={
                      designMode === "app"
                        ? "What native mobile app shall we design?"
                        : "What web application shall we build?"
                    }
                    className="w-full bg-transparent text-white placeholder-zinc-500 text-base sm:text-lg resize-none outline-none focus:outline-none font-normal"
                    disabled={isStreaming}
                  />

                  {/* Card Bottom Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                    {/* Left side: Context + App/Web toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                        title="Add Context"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* Segmented App / Web Switcher */}
                      <div className="flex items-center p-0.5 rounded-full bg-[#14151b] border border-white/5 text-xs">
                        <button
                          type="button"
                          onClick={() => setDesignMode("app")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
                            designMode === "app"
                              ? "bg-[#282a36] text-white shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>App</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignMode("web")}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
                            designMode === "web"
                              ? "bg-[#282a36] text-white shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Web</span>
                        </button>
                      </div>
                    </div>

                    {/* Right side: Tools & Send */}
                    <div className="flex items-center gap-2">
                      {/* Web search toggle */}
                      <button
                        type="button"
                        onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          webSearchEnabled ? "text-[#4D90FE] bg-[#4D90FE]/15" : "text-zinc-400 hover:text-white bg-white/5"
                        }`}
                        title="Toggle Web Search"
                      >
                        <Globe className="w-4 h-4" />
                      </button>

                      {/* Model pill selector inside card */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 font-medium transition-all">
                            <Sparkles className="w-3.5 h-3.5 text-[#4D90FE]" />
                            <span>3 Flash</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#181920] border-white/10 text-white p-1 shadow-2xl rounded-2xl">
                          {AVAILABLE_MODELS.map((model) => (
                            <DropdownMenuItem
                              key={model.id}
                              onClick={() => setSelectedModel(model.id)}
                              className="flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer hover:bg-white/10"
                            >
                              <span>{model.name}</span>
                              {selectedModel === model.id && <Check className="w-3.5 h-3.5 text-[#4D90FE]" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Voice / Mic */}
                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                        }`}
                        title="Voice prompt"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {/* Send / Generate Arrow Button */}
                      <button
                        type="button"
                        disabled={!inputValue.trim() || isStreaming}
                        onClick={() => sendMessage()}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          inputValue.trim()
                            ? "bg-white text-black hover:bg-zinc-200 shadow-md cursor-pointer"
                            : "bg-white/10 text-zinc-600 cursor-not-allowed"
                        }`}
                        title="Generate Design"
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
                  {(designMode === "app" ? appSuggestions : webSuggestions).map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(s.text)}
                      disabled={isStreaming}
                      className="flex items-center gap-2 bg-[#1c1d25]/75 hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md transition-all shadow-sm group cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C084FC] group-hover:scale-110 transition-transform" />
                      <span className="truncate max-w-[260px] sm:max-w-none">{s.text}</span>
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
                {messages.map(msg => (
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
              <div className="input-wrapper bg-[#1c1d25]/90 border border-white/10">
                <textarea
                  ref={inputRef}
                  className="chat-input"
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
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="send-btn visible bg-white text-black hover:bg-zinc-200"
                        onClick={() => sendMessage()}
                        disabled={isStreaming}
                        title="Send message"
                        aria-label="Send message"
                      >
                        <ArrowUp className="w-4 h-4 text-black" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="mic"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleSpeechRecognition}
                        className={`mic-btn ${isListening ? "text-red-400 animate-pulse bg-red-500/20" : ""}`}
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
              Stitch AI can make mistakes. Verify critical code and designs.
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
