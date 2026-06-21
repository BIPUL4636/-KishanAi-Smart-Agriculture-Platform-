import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

// Suggested quick-start prompts for new users
const QUICK_PROMPTS = [
  'Best crop for sandy soil?',
  'How to prevent tomato blight?',
  'When to apply urea fertilizer?',
  'Wheat mandi price today?',
  'Tips for monsoon farming',
];

// Floating AgriBot chat component — appears on all protected pages
export default function AgriBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Namaste! 🙏 I\'m AgriBot, your farming assistant. Ask me anything about crops, diseases, fertilizers, or weather!' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scrolls to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Sends a message to the AgriBot API and appends the response
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Build history for context (exclude the initial greeting)
      const history = updatedMessages
        .filter((m) => m !== messages[0])
        .map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

      const res = await sendChatMessage(trimmed, history);
      const reply = res.data.data?.reply || 'Sorry, I could not process that. Please try again.';

      setMessages((prev) => [...prev, { role: 'bot', content: reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to get response. Please check your connection.';
      setMessages((prev) => [...prev, { role: 'bot', content: `❌ ${errMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handles Enter key press to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="agribot-panel scale-in" id="agribot-panel">
          {/* Header */}
          <div className="agribot-header">
            <div className="agribot-header-avatar">🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>AgriBot</p>
              <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>AI Farming Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                width: '1.75rem', height: '1.75rem', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="agribot-messages" id="agribot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.content}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts — shown when conversation is short */}
          {messages.length <= 2 && !isTyping && (
            <div className="quick-prompts">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="quick-prompt-btn"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="agribot-input-area">
            <input
              type="text"
              placeholder="Ask AgriBot anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              id="agribot-input"
            />
            <button
              className="agribot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              id="agribot-send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="agribot-fab pulse-glow"
        onClick={() => setIsOpen(!isOpen)}
        id="agribot-fab"
        title="Chat with AgriBot"
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
}
