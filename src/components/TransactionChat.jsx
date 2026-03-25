import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithTransaction } from '../services/gemini';
import { marked } from 'marked';

export default function TransactionChat({ txData, aiExplanation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Safely extract the initial text
  const initialExplanationStr = typeof aiExplanation === 'string' 
    ? aiExplanation 
    : (aiExplanation?.summary || 'Analysis Complete.') + '\n\n' + (aiExplanation?.explanation || '');

  useEffect(() => {
    // Reset chat when viewing a new transaction
    if (aiExplanation) {
      setMessages([
        { role: 'ai', content: initialExplanationStr }
      ]);
    }
  }, [txData?.hash, initialExplanationStr]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      // Exclude the first initial message from the "history" passed to the API 
      // since we already explicitly pass `initialExplanationStr` to the backend prompt.
      const chatHistory = messages.slice(1);
      
      const response = await chatWithTransaction(txData, initialExplanationStr, chatHistory, userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "**Error:** Could not fetch response. " + error.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!aiExplanation) return null;

  return (
    <div className="tx-chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble-wrapper ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`}>
              {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`chat-bubble ${msg.role}`}>
              <div 
                className="markdown-body" 
                dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} 
              />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble-wrapper ai">
            <div className="chat-avatar ai"><Bot size={16} /></div>
            <div className="chat-bubble ai typing">
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          placeholder="Ask a follow-up question..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          spellCheck="false"
        />
        <button type="submit" disabled={!inputText.trim() || isTyping} className="chat-send-btn">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
