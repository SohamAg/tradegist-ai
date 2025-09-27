import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import './LLMPage.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const LLMPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze your trades, understand market patterns, and improve your trading strategy. What would you like to discuss?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'This is a placeholder response. In the full implementation, this will be powered by advanced language models trained on trading data and market analysis.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="llm-page fade-in">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <MessageSquare size={32} />
          </div>
          <div>
            <h1>AI Trading Assistant</h1>
            <p>Chat with your personal AI trading coach</p>
          </div>
        </div>
        <div className="ai-badge">
          <Sparkles size={16} />
          <span>LLM Powered</span>
        </div>
      </div>

      <div className="chat-container card">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {message.content}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your trades, market analysis, or trading strategies..."
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={!inputMessage.trim()}>
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>

      <div className="llm-features">
        <div className="feature-grid">
          <div className="feature-item card">
            <div className="feature-icon">
              <Bot size={24} />
            </div>
            <h3>Trade Analysis</h3>
            <p>Get detailed analysis of your trading patterns and performance metrics</p>
          </div>
          <div className="feature-item card">
            <div className="feature-icon">
              <MessageSquare size={24} />
            </div>
            <h3>Strategy Discussion</h3>
            <p>Discuss and refine your trading strategies with AI-powered insights</p>
          </div>
          <div className="feature-item card">
            <div className="feature-icon">
              <Sparkles size={24} />
            </div>
            <h3>Market Insights</h3>
            <p>Receive real-time market analysis and trading opportunities</p>
          </div>
        </div>
      </div>

      <div className="llm-notice card">
        <div className="notice-header">
          <Bot size={24} />
          <h3>Advanced LLM Integration Coming Soon</h3>
        </div>
        <p>
          We're integrating state-of-the-art language models specifically trained on trading data to provide:
        </p>
        <ul>
          <li>Personalized trading advice based on your history</li>
          <li>Real-time market commentary and analysis</li>
          <li>Strategy backtesting and optimization suggestions</li>
          <li>Risk management recommendations</li>
          <li>Educational content tailored to your skill level</li>
        </ul>
        <div className="notice-footer">
          <span>Powered by GPT-4 and custom trading models</span>
        </div>
      </div>
    </div>
  );
};

export default LLMPage;