import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/components/chat/CustomChatUI.css";
import MagicRings from "@/components/chat/MagicRings";
import BorderGlow from "@/components/ui/BorderGlow";
import DOMPurify from "dompurify";
import { ErrorBoundary } from "react-error-boundary";

function ChatFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-white p-8 text-center" style={{ zIndex: 10 }}>
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-red-400 mb-6">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-6 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function IndexContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const chatInput = containerRef.current.querySelector('#chatInput') as HTMLTextAreaElement;
    const sendBtn = containerRef.current.querySelector('#sendBtn') as HTMLButtonElement;
    const welcomeState = containerRef.current.querySelector('#welcomeState') as HTMLDivElement;
    const messagesContainer = containerRef.current.querySelector('#messagesContainer') as HTMLDivElement;
    const chatArea = containerRef.current.querySelector('#chatArea') as HTMLDivElement;
    const bgGlow = containerRef.current.querySelector('#bgGlow') as HTMLDivElement;
    const micBtn = containerRef.current.querySelector('#micBtn') as HTMLButtonElement;
    
    const suggestionChips = containerRef.current.querySelectorAll('.suggestion-chip');
    
    let hasMessages = false;
    let messageHistory: {role: string, content: string}[] = [];

    function onInput() {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
      const has = chatInput.value.trim().length > 0;
      if (has && !isStreaming) {
        sendBtn.classList.add('visible');
        micBtn.classList.add('hidden-el');
      } else {
        sendBtn.classList.remove('visible');
        micBtn.classList.remove('hidden-el');
      }
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (chatInput.value.trim() && !isStreaming) sendMessage();
      }
    }

    function sendSuggestion(btn: HTMLElement) {
      if (isStreaming) return;
      chatInput.value = btn.textContent?.replace(/^[^\w]+ /, '') || '';
      onInput();
      sendMessage();
    }

    suggestionChips.forEach(chip => {
      chip.addEventListener('click', function(this: HTMLElement) {
        sendSuggestion(this);
      });
    });

    const newChatBtn = containerRef.current.querySelector('.sidebar-btn[title="New chat"]');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', newChat);
    }

    function newChat() {
      if (isStreaming) return;
      messagesContainer.innerHTML = '';
      messagesContainer.style.display = 'none';
      welcomeState.style.display = 'block';
      chatArea.classList.remove('has-messages');
      bgGlow.classList.remove('hidden');
      hasMessages = false;
      messageHistory = [];
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
      chatInput.addEventListener('input', onInput);
      chatInput.addEventListener('keydown', onKeydown);
    }

    async function sendMessage() {
      if (isStreaming) return;
      const text = chatInput.value.trim();
      if (!text) return;

      if (!hasMessages) {
        welcomeState.style.display = 'none';
        messagesContainer.style.display = 'flex';
        chatArea.classList.add('has-messages');
        bgGlow.classList.add('hidden');
        hasMessages = true;
      }

      appendMessage('user', text);
      messageHistory.push({ role: 'user', content: text });
      
      chatInput.value = '';
      chatInput.style.height = 'auto';
      sendBtn.classList.remove('visible');
      chatInput.disabled = true;
      setIsStreaming(true);

      const aiMsgEl = appendMessage('ai', '', true);

      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messageHistory,
            model: 'gemini-1.5-flash'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        if (!response.body) throw new Error("No response body");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiFullText = "";
        
        const bubble = aiMsgEl.querySelector('.msg-bubble') as HTMLElement;
        bubble.innerHTML = ''; // Clear typing indicator

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\
\
');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text_delta') {
                  aiFullText += data.text;
                  const formattedText = aiFullText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                  bubble.innerHTML = DOMPurify.sanitize(escHtml(formattedText));
                  scrollToBottom();
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Ignore parse errors on chunks
              }
            }
          }
        }
        
        messageHistory.push({ role: 'assistant', content: aiFullText });
        
      } catch (error: any) {
        console.error("Chat Error:", error);
        const bubble = aiMsgEl.querySelector('.msg-bubble') as HTMLElement;
        bubble.innerHTML = DOMPurify.sanitize(
          `<span style="color: #ef4444;">Lexa Error: ${error.message || 'Failed to connect.'}</span>`
        );
      } finally {
        chatInput.disabled = false;
        setIsStreaming(false);
        setTimeout(() => chatInput.focus(), 10);
      }
    }

    function appendMessage(role: string, text: string, isTyping = false) {
      const msg = document.createElement('div');
      msg.className = `message ${role}`;

      const avatarHtml = role === 'ai'
        ? `<div class="msg-avatar ai">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <defs><linearGradient id="mg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#4285f4"/><stop offset="100%" stop-color="#9b59b6"/>
              </linearGradient></defs>
              <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#mg)"/>
            </svg>
          </div>`
        : `<div class="msg-avatar user">P</div>`;

      const actionsHtml = `
        <div class="msg-actions">
          <button class="msg-action-btn" title="Copy" aria-label="Copy message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>`;

      const bubbleContent = isTyping 
        ? `<div class="typing-indicator">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
           </div>`
        : DOMPurify.sanitize(escHtml(text));

      msg.innerHTML = `
        ${avatarHtml}
        <div>
          <div class="msg-bubble" aria-live="polite">${bubbleContent}</div>
          ${role === 'ai' && !isTyping ? actionsHtml : ''}
        </div>`;

      messagesContainer.appendChild(msg);
      scrollToBottom();
      return msg;
    }

    function scrollToBottom() {
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function escHtml(str: string) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    }

    return () => {
      if (newChatBtn) newChatBtn.removeEventListener('click', newChat);
      if (sendBtn) sendBtn.removeEventListener('click', sendMessage);
      if (chatInput) {
        chatInput.removeEventListener('input', onInput);
        chatInput.removeEventListener('keydown', onKeydown);
      }
    };
  }, [isStreaming]);

  return (
    <div className="custom-chat-wrapper" ref={containerRef}>
      <aside className="sidebar" aria-label="Sidebar">
        <div className="sidebar-logo">
          <svg className="lexa-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4285f4"/>
                <stop offset="33%" stopColor="#9b59b6"/>
                <stop offset="66%" stopColor="#ea4335"/>
                <stop offset="100%" stopColor="#fbbc04"/>
              </linearGradient>
            </defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#g1)"/>
            <path d="M2 14 C8.5 14 14 8.5 14 14 C14 8.5 19.5 14 26 14 C19.5 14 14 19.5 14 14 C14 19.5 8.5 14 2 14Z" fill="url(#g1)" opacity="0.6"/>
          </svg>
        </div>

        <button className="sidebar-btn" title="New chat" aria-label="New chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>

        <div className="sidebar-spacer"></div>

        <div className="sidebar-bottom">
          <button className="settings-btn" title="Settings" onClick={() => navigate("/settings")} aria-label="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="main" role="main">
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
          <MagicRings ringCount={6} />
        </div>
        <div className="bg-glow" id="bgGlow"></div>

        <header className="header">
          <button className="model-selector">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2C12 8 18 12 12 12C18 12 12 18 12 22C12 16 6 12 12 12C6 12 12 8 12 2Z"/>
            </svg>
            Lexa Pro
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </header>

        <div className="chat-area" id="chatArea" aria-live="polite">
          <div className="welcome" id="welcomeState">
            <h1 className="welcome-title">Ask away, PARAG!</h1>
            <div className="suggestions">
              <button className="suggestion-chip" disabled={isStreaming}>✨ Help me write something</button>
              <button className="suggestion-chip" disabled={isStreaming}>🔍 Summarize a document</button>
              <button className="suggestion-chip" disabled={isStreaming}>💡 Brainstorm ideas</button>
            </div>
          </div>
          <div className="messages-container" id="messagesContainer" style={{ display: 'none' }}></div>
        </div>

        <div className="input-section">
          <BorderGlow animated={!isStreaming}>
            <div className="input-wrapper" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
              <textarea
                className="chat-input"
                id="chatInput"
                placeholder="Ask Lexa"
                rows={1}
                disabled={isStreaming}
                aria-label="Chat input message"
              ></textarea>
              <div className="input-right">
                <button className="send-btn" id="sendBtn" title="Send" disabled={isStreaming} aria-label="Send message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </BorderGlow>
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return (
    <ErrorBoundary FallbackComponent={ChatFallback}>
      <IndexContent />
    </ErrorBoundary>
  );
}

