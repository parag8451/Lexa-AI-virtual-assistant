import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { CitationsPanel } from "@/components/chat/CitationsPanel";
import { ChatHeader, getPersonalityPrompt } from "@/components/chat/ChatHeader";
import { ScrollToBottom } from "@/components/chat/ScrollToBottom";
import { KeyboardShortcuts } from "@/components/chat/KeyboardShortcuts";
import { ExportDialog } from "@/components/chat/ExportDialog";
import { ErrorMessage } from "@/components/chat/ErrorMessage";
import { ConversationInsights } from "@/components/chat/ConversationInsights";
import { FocusMode } from "@/components/chat/FocusMode";
import { VoiceChatMode } from "@/components/chat/VoiceChatMode";
import { RealtimeVoiceChat } from "@/components/chat/RealtimeVoiceChat";
import { OnboardingTour } from "@/components/chat/OnboardingTour";
import { AppLoadingScreen } from "@/components/chat/AppLoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useVoice } from "@/hooks/useVoice";
import { useWebSearch, Citation } from "@/hooks/useWebSearch";
import { useSentiment } from "@/hooks/useSentiment";
import { useUserPreferences, PersonalityType } from "@/hooks/useUserPreferences";
import { useMemories } from "@/hooks/useMemories";
import { useSearchThrottle } from "@/hooks/useSearchThrottle";
import { useModelRouting, ComplexityLevel } from "@/hooks/useModelRouting";
import { useCustomInstructions } from "@/hooks/useCustomInstructions";
import { streamChat, ChatMessage as StreamMessage } from "@/lib/streaming";
import { AI_MODELS } from "@/types/chat";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  
  const {
    conversations,
    currentConversation,
    messages,
    isLoading: conversationsLoading,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateLastAssistantMessage,
    saveAssistantMessage,
    startNewChat,
    setMessages,
  } = useConversations();

  const {
    isRecording,
    isTranscribing,
    isSpeaking,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  } = useVoice();

  const { search: webSearch } = useWebSearch();
  const { getOverallMood } = useSentiment();
  const { preferences, setPersonality, setSearchModel } = useUserPreferences();
  const { getMemoryContext, addMemory } = useMemories();
  const { isOnCooldown, remainingSeconds, startCooldown } = useSearchThrottle({
    cooldownSeconds: preferences?.search_cooldown_seconds || 30,
  });
  const { autoRouting, setAutoRouting, routeMessage } = useModelRouting();
  const { getActiveInstructionsPrompt } = useCustomInstructions();

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [isStreaming, setIsStreaming] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [showCitations, setShowCitations] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const [realtimeVoiceActive, setRealtimeVoiceActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [routedModel, setRoutedModel] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && isStreaming) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Track scroll position for scroll-to-bottom button
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // New chat: Ctrl+Shift+N
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "n") {
        e.preventDefault();
        startNewChat();
      }
      // Export: Ctrl+Shift+E
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "e") {
        e.preventDefault();
        if (messages.length > 0) setShowExport(true);
      }
      // Show shortcuts: ?
      if (e.key === "?" && e.shiftKey && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startNewChat, messages.length]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle sending messages with auto model routing
  const handleSend = useCallback(async (content: string, attachments?: File[]) => {
    if (!content.trim() && !attachments?.length) return;

    // Determine the model to use (auto-routed or manually selected)
    const modelToUse = autoRouting && routedModel ? routedModel : selectedModel;

    setError(null);
    setLastUserMessage(content);

    let conv = currentConversation;
    if (!conv) {
      conv = await createConversation();
      if (!conv) return;
    }

    // Pass conversation explicitly to ensure user message shows immediately
    addMessage("user", content, attachments || [], [], conv);
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      let responseContent = "";
      let citations: Citation[] = [];

      if (webSearchEnabled) {
        if (isOnCooldown) {
          toast.error(`Please wait ${remainingSeconds}s before searching again`);
          return;
        }
        
        try {
          const searchResult = await webSearch(
            content, 
            messages.map(m => ({ role: m.role, content: m.content })),
            preferences?.preferred_search_model
          );
          
          // Handle rate limiting
          if (searchResult.rateLimited) {
            startCooldown(searchResult.retryAfter || 30);
            toast.warning("Search is busy. Please wait and try again.");
          }
          
          responseContent = searchResult.content;
          citations = searchResult.citations;
          setActiveCitations(citations);
          setShowCitations(citations.length > 0);
          updateLastAssistantMessage(responseContent, citations);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Web search failed";
          setError(errMsg);
          toast.error(errMsg);
        }
      } else {
        const streamMessages: StreamMessage[] = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user" as const, content },
        ];
        
        // Get personality, custom instructions, and memory context
        const personalityPrompt = getPersonalityPrompt(preferences?.personality || "friendly");
        const customInstructionsPrompt = getActiveInstructionsPrompt();
        const memoryContext = getMemoryContext(content);
        const fullSystemPrompt = personalityPrompt + customInstructionsPrompt;

        await streamChat({
          messages: streamMessages,
          model: modelToUse,
          systemPrompt: fullSystemPrompt,
          memoryContext,
          signal: abortControllerRef.current.signal,
          onDelta: (delta) => {
            responseContent += delta;
            updateLastAssistantMessage(responseContent);
          },
          onDone: () => {
            setIsStreaming(false);
          },
          onError: (error) => {
            const errMsg = error.message || "Something went wrong";
            setError(errMsg);
            toast.error(errMsg);
            setIsStreaming(false);
          },
        });
      }

      if (responseContent) {
        saveAssistantMessage(responseContent, modelToUse, citations);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Something went wrong";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsStreaming(false);
      setRoutedModel(null); // Reset routed model after send
    }
  }, [
    currentConversation,
    createConversation,
    addMessage,
    webSearchEnabled,
    webSearch,
    messages,
    updateLastAssistantMessage,
    saveAssistantMessage,
    selectedModel,
    autoRouting,
    routedModel,
    getActiveInstructionsPrompt,
    preferences?.personality,
    getMemoryContext,
    isOnCooldown,
    remainingSeconds,
    startCooldown,
  ]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      setError(null);
      // Remove the last failed messages
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === "assistant" && lastMsg.content === "") {
          setMessages(prev => prev.slice(0, -2));
        } else if (lastMsg.role === "user") {
          setMessages(prev => prev.slice(0, -1));
        }
      }
      handleSend(lastUserMessage);
    }
  }, [lastUserMessage, messages, setMessages, handleSend]);

  // Handle regenerating last response
  const handleRegenerate = useCallback(async () => {
    if (messages.length < 2) return;
    
    const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.role === "user");
    if (lastUserMsgIndex === -1) return;
    
    const lastUserMsg = messages[messages.length - 1 - lastUserMsgIndex];
    
    setMessages(prev => prev.slice(0, -1));
    setIsStreaming(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    
    let responseContent = "";
    const streamMessages: StreamMessage[] = messages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }));

    await streamChat({
      messages: streamMessages,
      model: selectedModel,
      signal: abortControllerRef.current.signal,
      onDelta: (delta) => {
        responseContent += delta;
        updateLastAssistantMessage(responseContent);
      },
      onDone: () => {
        setIsStreaming(false);
        if (responseContent) {
          saveAssistantMessage(responseContent, selectedModel);
        }
      },
      onError: (error) => {
        setError(error.message);
        toast.error(error.message);
        setIsStreaming(false);
      },
    });
  }, [messages, selectedModel, updateLastAssistantMessage, saveAssistantMessage, setMessages]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const handleSuggestionClick = useCallback((prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  const handleQuickAction = useCallback((action: string, prompt: string) => {
    handleSend(prompt);
  }, [handleSend]);

  const handleSelectConversation = useCallback((id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      selectConversation(conv);
      setMobileSidebarOpen(false);
      setError(null);
    }
  }, [conversations, selectConversation]);

  const handleRenameConversation = useCallback(async (id: string, title: string) => {
    console.log("Rename:", id, title);
  }, []);

  // Handle template usage - puts content in chat input
  const handleUseTemplate = useCallback((content: string) => {
    handleSend(content);
  }, [handleSend]);

  // Handle complexity change from ChatInput for auto-routing
  const handleComplexityChange = useCallback((complexity: ComplexityLevel | null, modelId: string | null) => {
    setRoutedModel(modelId);
  }, []);

  if (loading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background relative">
        {/* Ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet-500/3 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/2 rounded-full blur-3xl animate-[breathe_15s_ease-in-out_infinite]" />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 lg:relative lg:z-0",
            "transition-transform duration-300 ease-out",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <ChatSidebar
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onNewChat={startNewChat}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={deleteConversation}
            onRenameConversation={handleRenameConversation}
            onSignOut={signOut}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0 relative z-10">
          <div className="flex items-center justify-between">
            <ChatHeader
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isStreaming={isStreaming}
              webSearchEnabled={webSearchEnabled}
              mobileSidebarOpen={mobileSidebarOpen}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onExport={() => setShowExport(true)}
              onShowShortcuts={() => setShowShortcuts(true)}
              hasMessages={messages.length > 0}
              personality={preferences?.personality || "friendly"}
              onPersonalityChange={(p) => setPersonality(p)}
              searchModel={preferences?.preferred_search_model || "lexa-search-fast"}
              onSearchModelChange={(m) => setSearchModel(m)}
              searchCooldown={remainingSeconds}
              onUseTemplate={handleUseTemplate}
              autoRouting={autoRouting}
              onAutoRoutingChange={setAutoRouting}
            />
            <div className="flex items-center gap-2 pr-4">
              <FocusMode 
                isActive={focusModeActive} 
                onToggle={() => setFocusModeActive(!focusModeActive)} 
              />
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Messages */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <AnimatePresence mode="wait">
              {messages.length === 0 && !isStreaming ? (
                /* Gemini-style centered layout for welcome screen */
                <motion.div 
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  <WelcomeScreen 
                    onSuggestionClick={handleSuggestionClick} 
                    userName={user?.user_metadata?.full_name?.split(" ")[0]} 
                  />
                  {/* Input positioned below greeting */}
                  <ChatInput
                    onSend={handleSend}
                    isLoading={isStreaming}
                    onStop={handleStop}
                    disabled={conversationsLoading}
                    isRecording={isRecording}
                    isTranscribing={isTranscribing}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    webSearchEnabled={webSearchEnabled}
                    onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
                    onOpenRealtimeVoice={() => setRealtimeVoiceActive(true)}
                    autoRouting={autoRouting}
                    onComplexityChange={handleComplexityChange}
                  />
                </motion.div>
              ) : (
                /* Standard chat layout with messages */
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto chat-scrollbar"
                  >
                    <div className="pb-4">
                      {messages.map((message, index) => {
                        const isLastAssistant = message.role === "assistant" && 
                          index === messages.length - 1;
                        return (
                          <ChatMessage
                            key={message.id}
                            message={message}
                            isStreaming={isStreaming && isLastAssistant}
                            isSpeaking={isSpeaking}
                            onSpeak={speak}
                            onStopSpeaking={stopSpeaking}
                            onRegenerate={handleRegenerate}
                            isLastAssistant={isLastAssistant && !isStreaming}
                            onQuickAction={handleQuickAction}
                            showQuickActions={true}
                          />
                        );
                      })}

                      {/* Conversation Insights */}
                      {messages.length >= 4 && !isStreaming && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="px-4 md:px-6 py-4"
                        >
                          <div className="max-w-3xl mx-auto">
                            <ConversationInsights 
                              messages={messages} 
                              overallMood={getOverallMood()}
                            />
                          </div>
                        </motion.div>
                      )}
                      {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                        <TypingIndicator />
                      )}
                    </div>

                    {/* Error message with retry */}
                    {error && !isStreaming && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 md:px-6 pb-4"
                      >
                        <div className="max-w-3xl mx-auto">
                          <ErrorMessage message={error} onRetry={handleRetry} />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Scroll to bottom button */}
                  <ScrollToBottom show={showScrollButton} onClick={scrollToBottom} />

                  {/* Input at bottom */}
                  <div className="border-t border-border/30 bg-background/70 backdrop-blur-xl py-4">
                    <ChatInput
                      onSend={handleSend}
                      isLoading={isStreaming}
                      onStop={handleStop}
                      disabled={conversationsLoading}
                      isRecording={isRecording}
                      isTranscribing={isTranscribing}
                      onStartRecording={startRecording}
                      onStopRecording={stopRecording}
                      webSearchEnabled={webSearchEnabled}
                      onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
                      onOpenRealtimeVoice={() => setRealtimeVoiceActive(true)}
                      autoRouting={autoRouting}
                      onComplexityChange={handleComplexityChange}
                    />
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Citations panel */}
            <AnimatePresence>
            {showCitations && activeCitations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CitationsPanel
                  citations={activeCitations}
                  onClose={() => setShowCitations(false)}
                />
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modals */}
        <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
        <ExportDialog
          open={showExport}
          onOpenChange={setShowExport}
          messages={messages}
          title={currentConversation?.title || "Chat Export"}
        />
        
        {/* Realtime Voice Chat */}
        <RealtimeVoiceChat
          isActive={realtimeVoiceActive}
          onClose={() => setRealtimeVoiceActive(false)}
        />
        
        {/* Onboarding Tour for new users */}
        <OnboardingTour />
      </div>
    </TooltipProvider>
  );
}
