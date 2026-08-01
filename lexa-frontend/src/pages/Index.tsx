import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, ArrowDown, Copy, Check, ThumbsUp, ThumbsDown,
  Plus, Settings, Sparkles, ChevronDown, Mic, MicOff,
  Volume2, VolumeX, Download, Trash2, Globe, CheckCircle2,
  Cpu, Zap, Shield, Wand2
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import "@/components/chat/CustomChatUI.css";
import SoftAurora from "@/components/chat/SoftAurora";
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
      className="suggestion-chip"
      onClick={onClick}
      disabled={disabled}
    >
      {emoji} {text}
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
  const suggestions = [
    { emoji: "✨", text: "Explain quantum computing in simple terms" },
    { emoji: "⚡", text: "Write a high-performance React TypeScript hook" },
    { emoji: "🔍", text: "Analyze the pros and cons of microservices" },
    { emoji: "🎨", text: "Brainstorm 5 innovative startup ideas for 2026" },
  ];

  return (
    <div className="custom-chat-wrapper">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar" aria-label="Sidebar">
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
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="sidebar-btn"
              title="New chat"
              aria-label="New chat"
              onClick={handleNewChat}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right">New Chat</TooltipContent>
        </Tooltip>

        {hasMessages && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="sidebar-btn"
                title="Export conversation"
                aria-label="Export conversation"
                onClick={handleExportChat}
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">Export Chat</TooltipContent>
          </Tooltip>
        )}

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="settings-btn"
                title="Settings"
                onClick={() => navigate("/settings")}
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="main" role="main">
        {/* Background Aurora */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.85, pointerEvents: "none" }}>
          <SoftAurora
            speed={0.1}
            scale={0.5}
            brightness={3}
            color1="#0f5ae6"
            color2="#15245b"
            noiseFrequency={2}
            noiseAmplitude={3}
            bandHeight={0.65}
            bandSpread={0.3}
            octaveDecay={0.17}
            layerOffset={0.4}
            colorSpeed={3.8}
            enableMouseInteraction
            mouseInfluence={0.1}
          />
        </div>

        <AnimatePresence>
          {!hasMessages && (
            <motion.div
              key="bg-glow"
              initial={{ opacity: 0.6 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="bg-glow"
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="header flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Model selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="model-selector flex items-center gap-2"
                >
                  <currentModelInfo.icon className="w-4 h-4 text-primary" />
                  <span>{currentModelInfo.name}</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                    {currentModelInfo.badge}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 glass-strong border-border/40 p-2 shadow-2xl z-50">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Select AI Model
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/30" />
                {AVAILABLE_MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = selectedModel === model.id;
                  return (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/15 text-foreground" : "hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{model.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-muted/60 text-muted-foreground font-medium">
                            {model.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground/80 truncate">{model.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
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
                  ? "bg-primary/15 text-primary border-primary/30 shadow-sm"
                  : "bg-muted/30 text-muted-foreground border-border/30 hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                webSearchEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {webSearchEnabled ? "ON" : "OFF"}
              </span>
            </motion.button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div
          className={`chat-area ${hasMessages ? "has-messages" : ""}`}
          id="chatArea"
          ref={chatAreaRef}
          onScroll={handleScroll}
          aria-live="polite"
        >
          {/* Welcome State */}
          <AnimatePresence mode="wait">
            {!hasMessages && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="welcome"
              >
                <h1 className="welcome-title">Ask away, PARAG!</h1>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="suggestions"
                >
                  {suggestions.map((s, i) => (
                    <SuggestionChip
                      key={i}
                      emoji={s.emoji}
                      text={s.text}
                      disabled={isStreaming}
                      onClick={() => sendMessage(s.text)}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
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

          {/* Scroll to bottom */}
          <ScrollToBottomButton
            visible={showScrollBtn}
            onClick={() => scrollToBottom()}
          />
        </div>

        {/* Input Section */}
        <div className="input-section">
          <div className={`input-glow-wrapper ${inputFocused ? "focused" : ""}`}>
            <div className="input-wrapper">
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
                      className="send-btn visible"
                      onClick={() => sendMessage()}
                      disabled={isStreaming}
                      title="Send message"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="disclaimer"
          >
            Lexa can make mistakes. Consider checking important information.
          </motion.p>
        </div>
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
