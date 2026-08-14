import { useReducer, useCallback, useRef, useEffect, useMemo } from "react";
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
  { id: "gemini-1.5-flash", name: "Lexa Fast", badge: "Fast", desc: "Low-latency multimodal assistant with live vision" },
  { id: "gemini-1.5-flash-8b", name: "Lexa Balanced", badge: "Balanced", desc: "Balanced intelligence for general reasoning" },
  { id: "gemini-1.5-pro", name: "Lexa Pro", badge: "Pro", desc: "Deep reasoning, documents, and complex code" },
];

type DesignMode = "assistant" | "code" | "web" | "mobile";

interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  attachments: FileAttachment[];
  isStreaming: boolean;
  isListening: boolean;
  selectedModel: string;
  webSearchEnabled: boolean;
  showScrollBtn: boolean;
  speakingMessageId: string | null;
  designMode: DesignMode;
  isPrivateConversation: boolean;
  previewImageUrl: string | null;
  conversations: StoredConversation[];
  currentConversationId: string | null;
  isHistoryOpen: boolean;
  historySearch: string;
  editingConvId: string | null;
  editingTitle: string;
}

type ChatAction =
  | { type: "SET_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: "SET_INPUT_VALUE"; payload: string }
  | { type: "SET_ATTACHMENTS"; payload: FileAttachment[] }
  | { type: "ADD_ATTACHMENTS"; payload: FileAttachment[] }
  | { type: "REMOVE_ATTACHMENT"; payload: string }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "SET_LISTENING"; payload: boolean }
  | { type: "SET_SELECTED_MODEL"; payload: string }
  | { type: "SET_WEB_SEARCH"; payload: boolean }
  | { type: "SET_SHOW_SCROLL_BTN"; payload: boolean }
  | { type: "SET_SPEAKING_MESSAGE_ID"; payload: string | null }
  | { type: "SET_DESIGN_MODE"; payload: DesignMode }
  | { type: "SET_PRIVATE_CONVERSATION"; payload: boolean }
  | { type: "SET_PREVIEW_IMAGE_URL"; payload: string | null }
  | { type: "SET_CONVERSATIONS"; payload: StoredConversation[] }
  | { type: "SET_CURRENT_CONVERSATION_ID"; payload: string | null }
  | { type: "SET_HISTORY_OPEN"; payload: boolean }
  | { type: "SET_HISTORY_SEARCH"; payload: string }
  | { type: "SET_EDITING_CONV_ID"; payload: string | null }
  | { type: "SET_EDITING_TITLE"; payload: string }
  | { type: "RESET_STATE" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        ),
      };
    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.payload };
    case "SET_ATTACHMENTS":
      return { ...state, attachments: action.payload };
    case "ADD_ATTACHMENTS":
      return { ...state, attachments: [...state.attachments, ...action.payload] };
    case "REMOVE_ATTACHMENT":
      return { ...state, attachments: state.attachments.filter((a) => a.id !== action.payload) };
    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload };
    case "SET_LISTENING":
      return { ...state, isListening: action.payload };
    case "SET_SELECTED_MODEL":
      return { ...state, selectedModel: action.payload };
    case "SET_WEB_SEARCH":
      return { ...state, webSearchEnabled: action.payload };
    case "SET_SHOW_SCROLL_BTN":
      return { ...state, showScrollBtn: action.payload };
    case "SET_SPEAKING_MESSAGE_ID":
      return { ...state, speakingMessageId: action.payload };
    case "SET_DESIGN_MODE":
      return { ...state, designMode: action.payload };
    case "SET_PRIVATE_CONVERSATION":
      return { ...state, isPrivateConversation: action.payload };
    case "SET_PREVIEW_IMAGE_URL":
      return { ...state, previewImageUrl: action.payload };
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "SET_CURRENT_CONVERSATION_ID":
      return { ...state, currentConversationId: action.payload };
    case "SET_HISTORY_OPEN":
      return { ...state, isHistoryOpen: action.payload };
    case "SET_HISTORY_SEARCH":
      return { ...state, historySearch: action.payload };
    case "SET_EDITING_CONV_ID":
      return { ...state, editingConvId: action.payload };
    case "SET_EDITING_TITLE":
      return { ...state, editingTitle: action.payload };
    case "RESET_STATE":
      return {
        ...state,
        messages: [],
        inputValue: "",
        attachments: [],
        isStreaming: false,
        currentConversationId: null,
        speakingMessageId: null,
      };
    default:
      return state;
  }
}

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

function loadInitialConversations(): StoredConversation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const initialState: ChatState = {
  messages: [],
  inputValue: "",
  attachments: [],
  isStreaming: false,
  isListening: false,
  selectedModel: "gemini-3.5-flash",
  webSearchEnabled: false,
  showScrollBtn: false,
  speakingMessageId: null,
  designMode: "assistant",
  isPrivateConversation: false,
  previewImageUrl: null,
  conversations: loadInitialConversations(),
  currentConversationId: null,
  isHistoryOpen: false,
  historySearch: "",
  editingConvId: null,
  editingTitle: "",
};

export function useChatReducer() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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
        dispatch({ type: "SET_INPUT_VALUE", payload: transcript });
      };
      recognition.onerror = () => dispatch({ type: "SET_LISTENING", payload: false });
      recognition.onend = () => dispatch({ type: "SET_LISTENING", payload: false });
      recognitionRef.current = recognition;
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
          state.conversations.forEach((c) => map.set(c.id, c));
          dbConvs.forEach((c) => map.set(c.id, c));
          const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
          dispatch({ type: "SET_CONVERSATIONS", payload: merged });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      } catch (err) {
        console.warn("Supabase sync skipped:", err);
      }
    }
    syncSupabaseConversations();
  }, [state.conversations]);

  // Action creators
  const actions = useMemo(() => ({
    setMessages: (messages: ChatMessage[]) => dispatch({ type: "SET_MESSAGES", payload: messages }),
    addMessage: (message: ChatMessage) => dispatch({ type: "ADD_MESSAGE", payload: message }),
    updateMessage: (id: string, updates: Partial<ChatMessage>) =>
      dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates } }),
    setInputValue: (value: string) => dispatch({ type: "SET_INPUT_VALUE", payload: value }),
    setAttachments: (attachments: FileAttachment[]) => dispatch({ type: "SET_ATTACHMENTS", payload: attachments }),
    addAttachments: (attachments: FileAttachment[]) => dispatch({ type: "ADD_ATTACHMENTS", payload: attachments }),
    removeAttachment: (id: string) => dispatch({ type: "REMOVE_ATTACHMENT", payload: id }),
    setStreaming: (value: boolean) => dispatch({ type: "SET_STREAMING", payload: value }),
    setListening: (value: boolean) => dispatch({ type: "SET_LISTENING", payload: value }),
    setSelectedModel: (model: string) => dispatch({ type: "SET_SELECTED_MODEL", payload: model }),
    setWebSearchEnabled: (value: boolean) => dispatch({ type: "SET_WEB_SEARCH", payload: value }),
    setShowScrollBtn: (value: boolean) => dispatch({ type: "SET_SHOW_SCROLL_BTN", payload: value }),
    setSpeakingMessageId: (id: string | null) => dispatch({ type: "SET_SPEAKING_MESSAGE_ID", payload: id }),
    setDesignMode: (mode: DesignMode) => dispatch({ type: "SET_DESIGN_MODE", payload: mode }),
    setPrivateConversation: (value: boolean) => dispatch({ type: "SET_PRIVATE_CONVERSATION", payload: value }),
    setPreviewImageUrl: (url: string | null) => dispatch({ type: "SET_PREVIEW_IMAGE_URL", payload: url }),
    setConversations: (convs: StoredConversation[]) => dispatch({ type: "SET_CONVERSATIONS", payload: convs }),
    setCurrentConversationId: (id: string | null) => dispatch({ type: "SET_CURRENT_CONVERSATION_ID", payload: id }),
    setIsHistoryOpen: (value: boolean) => dispatch({ type: "SET_HISTORY_OPEN", payload: value }),
    setHistorySearch: (value: string) => dispatch({ type: "SET_HISTORY_SEARCH", payload: value }),
    setEditingConvId: (id: string | null) => dispatch({ type: "SET_EDITING_CONV_ID", payload: id }),
    setEditingTitle: (title: string) => dispatch({ type: "SET_EDITING_TITLE", payload: title }),
    resetState: () => dispatch({ type: "RESET_STATE" }),
  }), []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  const handleScroll = () => {
    if (!chatAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
    dispatch({ type: "SET_SHOW_SCROLL_BTN", payload: scrollHeight - scrollTop - clientHeight > 150 });
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (state.isListening) {
      recognitionRef.current.stop();
      dispatch({ type: "SET_LISTENING", payload: false });
    } else {
      try {
        recognitionRef.current.start();
        dispatch({ type: "SET_LISTENING", payload: true });
      } catch {
        dispatch({ type: "SET_LISTENING", payload: false });
      }
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if (!("speechSynthesis" in window)) return;
    if (state.speakingMessageId === id) {
      window.speechSynthesis.cancel();
      dispatch({ type: "SET_SPEAKING_MESSAGE_ID", payload: null });
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`\[\]]/g, "").replace(/\n/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => dispatch({ type: "SET_SPEAKING_MESSAGE_ID", payload: null });
    utterance.onerror = () => dispatch({ type: "SET_SPEAKING_MESSAGE_ID", payload: null });
    dispatch({ type: "SET_SPEAKING_MESSAGE_ID", payload: id });
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
      dispatch({ type: "ADD_ATTACHMENTS", payload: parsedList });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const persistConversations = useCallback((updated: StoredConversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }, []);

  const getPlaceholder = useCallback(() => {
    if (state.attachments.length > 0) return `Ask about ${state.attachments.length} attached item(s)...`;
    switch (state.designMode) {
      case "code": return "Ask for code, architecture, algorithms, or refactoring...";
      case "web": return "What web application or component shall we build?";
      case "mobile": return "What native mobile feature or screen shall we design?";
      default: return "Ask Lexa AI anything, attach files, or scan documents...";
    }
  }, [state.attachments.length, state.designMode]);

  const filteredConversations = state.conversations.filter((c) =>
    c.title.toLowerCase().includes(state.historySearch.toLowerCase())
  );
  const groupedHistory = groupConversations(filteredConversations);

  return {
    state,
    actions,
    chatAreaRef,
    fileInputRef,
    scrollToBottom,
    handleScroll,
    toggleSpeechRecognition,
    handleSpeak,
    handleCopy,
    handleFileUpload,
    persistConversations,
    getPlaceholder,
    filteredConversations,
    groupedHistory,
    AVAILABLE_MODELS,
    generateId,
    currentModelInfo: AVAILABLE_MODELS.find((m) => m.id === state.selectedModel) || AVAILABLE_MODELS[0],
    hasMessages: state.messages.length > 0,
  };
}