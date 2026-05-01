import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Trash2, X } from 'lucide-react';
import chatService from '../services/chatService';

const introMessage = `Hi! I am your BusGo assistant.

Ask me things like:

- **Dhaka to Chittagong on 2026-05-10 at 06:00 how many tickets are available?**
- **Which buses go from Dhaka to Chittagong?**
- **Show price and schedule for Green Line Paribahan**

For exact seat availability, include _route_, _date_, and optionally _time_.`;

const parseInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-gray-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      (part.startsWith('_') && part.endsWith('_')) ||
      (part.startsWith('*') && part.endsWith('*'))
    ) {
      return (
        <em key={index} className="italic text-gray-700">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const formatMessage = (content) => {
  if (!content) return null;

  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      return (
        <div key={index} className="mb-2 flex gap-2">
          <span className="font-bold text-orange-600">{numberedMatch[1]}.</span>
          <span>{parseInlineMarkdown(numberedMatch[2])}</span>
        </div>
      );
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={index} className="mb-2 flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
          <span>{parseInlineMarkdown(bulletMatch[1])}</span>
        </div>
      );
    }

    return (
      <p key={index} className="mb-2 last:mb-0">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
};

const Chatbot = ({ isOpen: externalIsOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: introMessage,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const closeChat = () => {
    setIsOpen(false);
    onClose?.();
  };

  const goToLogin = () => {
    closeChat();
    navigate('/login');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('Please login to use the AI assistant.');
      setTimeout(goToLogin, 1500);
      return;
    }

    const prompt = inputValue.trim();
    if (!prompt || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .slice(-8)
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const response = await chatService.sendMessage(prompt, conversationHistory);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      const message =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';

      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `**Sorry, I could not complete that request.**\n\n${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: introMessage,
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden border border-gray-100 bg-white shadow-2xl md:inset-auto md:right-6 md:top-20 md:h-[min(720px,calc(100vh-7rem))] md:w-[430px] md:rounded-3xl">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">BusGo AI Assistant</h3>
              <p className="text-sm text-white/90">Live route, fare, and database seat help</p>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="rounded-xl p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50 p-5">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-none bg-orange-500 font-medium text-white'
                  : 'rounded-bl-none border border-gray-200 bg-white text-gray-800 shadow-sm'
              }`}
            >
              {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
              </div>
              <span className="text-sm text-gray-500">Checking data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="shrink-0 border-t bg-white p-4">
        {!isAuthenticated ? (
          <div className="py-3 text-center">
            <p className="mb-3 text-sm text-gray-600">Please login to use the AI assistant.</p>
            <button
              onClick={goToLogin}
              className="rounded-xl bg-orange-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask: Dhaka to Chittagong 2026-05-10 06:00 seats?"
                className="min-w-0 flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-sm outline-none ring-orange-300 transition focus:ring-2"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:bg-orange-300"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            <button
              onClick={handleClearChat}
              className="mx-auto mt-3 flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear chat
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
