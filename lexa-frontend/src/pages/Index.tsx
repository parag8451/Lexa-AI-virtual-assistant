import React, { useEffect, useRef } from "react";
import "@/components/chat/CustomChatUI.css";

export default function Index() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // We bind the elements scoped to this container to avoid global document collisions
    const chatInput = containerRef.current.querySelector('#chatInput') as HTMLTextAreaElement;
    const sendBtn = containerRef.current.querySelector('#sendBtn') as HTMLButtonElement;
    const welcomeState = containerRef.current.querySelector('#welcomeState') as HTMLDivElement;
    const messagesContainer = containerRef.current.querySelector('#messagesContainer') as HTMLDivElement;
    const chatArea = containerRef.current.querySelector('#chatArea') as HTMLDivElement;
    const bgGlow = containerRef.current.querySelector('#bgGlow') as HTMLDivElement;
    const micBtn = containerRef.current.querySelector('#micBtn') as HTMLButtonElement;
    
    // We attach suggestion buttons manually
    const suggestionChips = containerRef.current.querySelectorAll('.suggestion-chip');
    
    let hasMessages = false;

    const AI_RESPONSES = [
      "I'd be happy to help with that! Let me think through this carefully for you. The key aspects to consider here are the context, your specific goals, and the best approach to achieve them. I'll provide a thoughtful and comprehensive response tailored to your needs.",
      "Great question! There are several ways to approach this. First, let's consider the fundamentals — understanding the core concepts will help us navigate the details. I'll walk you through a step-by-step breakdown that should make things crystal clear.",
      "Absolutely! This is something I can help you with. Based on what you've shared, I think the most effective approach would be to start by breaking this down into manageable parts. Here's what I'd recommend...",
      "Of course! Let me give you a thorough answer. This topic has a few important dimensions worth exploring. I'll cover the main points and make sure you have everything you need to move forward confidently.",
    ];

    function onInput() {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
      const has = chatInput.value.trim().length > 0;
      if (has) {
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
        if (chatInput.value.trim()) sendMessage();
      }
    }

    function sendSuggestion(btn: HTMLElement) {
      chatInput.value = btn.textContent?.replace(/^[^\w]+ /, '') || '';
      onInput();
      sendMessage();
    }

    // Attach to window so onclick works, or better yet, attach listeners directly
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', function(this: HTMLElement) {
        sendSuggestion(this);
      });
    });

    // Handle new chat button
    const newChatBtn = containerRef.current.querySelector('.sidebar-btn[title="New chat"]');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', newChat);
    }

    function newChat() {
      messagesContainer.innerHTML = '';
      messagesContainer.style.display = 'none';
      welcomeState.style.display = 'block';
      chatArea.classList.remove('has-messages');
      bgGlow.classList.remove('hidden');
      hasMessages = false;
    }

    // Handle send button
    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
      chatInput.addEventListener('input', onInput);
      chatInput.addEventListener('keydown', onKeydown);
    }

    function sendMessage() {
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
      chatInput.value = '';
      chatInput.style.height = 'auto';
      sendBtn.classList.remove('visible');

      // Typing indicator
      const typingId = appendTyping();

      setTimeout(() => {
        removeTyping(typingId);
        const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
        appendMessage('ai', response);
      }, 1200 + Math.random() * 800);
    }

    function appendMessage(role: string, text: string) {
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
          <button class="msg-action-btn" title="Copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button class="msg-action-btn" title="Good response">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
            </svg>
          </button>
          <button class="msg-action-btn" title="Bad response">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
              <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
            </svg>
          </button>
          <button class="msg-action-btn" title="Regenerate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
          </button>
        </div>`;

      msg.innerHTML = `
        ${avatarHtml}
        <div>
          <div class="msg-bubble">${escHtml(text)}</div>
          ${role === 'ai' ? actionsHtml : ''}
        </div>`;

      messagesContainer.appendChild(msg);
      scrollToBottom();
    }

    let typingCounter = 0;
    function appendTyping() {
      const id = 'typing-' + (++typingCounter);
      const el = document.createElement('div');
      el.className = 'message ai';
      el.id = id;
      el.innerHTML = `
        <div class="msg-avatar ai">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <defs><linearGradient id="mg2" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#4285f4"/><stop offset="100%" stop-color="#9b59b6"/>
            </linearGradient></defs>
            <path d="M14 2 C14 8.5 19.5 14 14 14 C19.5 14 14 19.5 14 26 C14 19.5 8.5 14 14 14 C8.5 14 14 8.5 14 2Z" fill="url(#mg2)"/>
          </svg>
        </div>
        <div class="msg-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>`;
      messagesContainer.appendChild(el);
      scrollToBottom();
      return id;
    }

    function removeTyping(id: string) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function scrollToBottom() {
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function escHtml(str: string) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    }

    // Cleanup listeners
    return () => {
      if (newChatBtn) newChatBtn.removeEventListener('click', newChat);
      if (sendBtn) sendBtn.removeEventListener('click', sendMessage);
      if (chatInput) {
        chatInput.removeEventListener('input', onInput);
        chatInput.removeEventListener('keydown', onKeydown);
      }
    };
  }, []);

  return (
    <div className="custom-chat-wrapper" ref={containerRef}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          {/* Lexa-style 4-point star (Replaced Gemini with Lexa star symbol) */}
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

        {/* New chat */}
        <button className="sidebar-btn" title="New chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>

        {/* Search */}
        <button className="sidebar-btn active" title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>

        {/* Apps */}
        <button className="sidebar-btn" title="Explore Apps">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </button>

        <div className="sidebar-spacer"></div>

        <div className="sidebar-bottom">
          <button className="settings-btn" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>

          <div className="avatar-wrapper">
            <div className="avatar">P</div>
          </div>

          <button className="sidebar-btn" title="Edu workspace" style={{ border: '1px solid var(--border)', borderRadius: '20px', width: 'auto', padding: '4px 10px', fontSize: '11px', color: 'var(--text-muted)', height: 'auto', gap: '4px' }}>
            Edu
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <div className="bg-glow" id="bgGlow"></div>

        {/* Header */}
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

        {/* Chat area */}
        <div className="chat-area" id="chatArea">
          {/* Welcome State */}
          <div className="welcome" id="welcomeState">
            <h1 className="welcome-title">Ask away, PARAG!</h1>
            <div className="suggestions">
              <button className="suggestion-chip">✨ Help me write something</button>
              <button className="suggestion-chip">🔍 Summarize a document</button>
              <button className="suggestion-chip">💡 Brainstorm ideas</button>
              <button className="suggestion-chip">🎯 Plan my week</button>
              <button className="suggestion-chip">🌐 Explain a concept</button>
              <button className="suggestion-chip">🖼️ Analyze an image</button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="messages-container" id="messagesContainer" style={{ display: 'none' }}></div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <div className="input-wrapper">
            <button className="attach-btn" title="Attach file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>

            <textarea
              className="chat-input"
              id="chatInput"
              placeholder="Ask Lexa"
              rows={1}
            ></textarea>

            <div className="input-right">
              <button className="model-pill" id="modelPill">
                Pro
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <button className="mic-btn" title="Use microphone" id="micBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>

              <button className="send-btn" id="sendBtn" title="Send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            </div>
          </div>
          <p className="disclaimer">Lexa can make mistakes, so double-check its responses.</p>
        </div>
      </main>
    </div>
  );
}
