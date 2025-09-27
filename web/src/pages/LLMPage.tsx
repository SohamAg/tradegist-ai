import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, Zap, Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
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
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze your trading patterns, provide insights on your performance, and answer questions about trading strategies. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "Analyze my recent trading performance",
    "What are signs of revenge trading?",
    "How can I improve my risk management?",
    "What's my biggest trading weakness?",
    "Suggest position sizing strategies"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('performance') || lowerQuestion.includes('analyze')) {
      return "Based on your recent trading data, I can see you have a 68% win rate with a total P&L of +$3,250. Your strongest area is disciplined entries (85/100 score), but I notice some overtrading patterns on high volatility days. Would you like me to dive deeper into any specific aspect of your performance?";
    }
    
    if (lowerQuestion.includes('revenge') || lowerQuestion.includes('emotional')) {
      return "Revenge trading is one of the most destructive patterns I see in traders. Key signs include: 1) Trading immediately after a loss, 2) Increasing position size after losses, 3) Abandoning your trading plan, 4) Trading outside your usual timeframes. Your current revenge trading score is low (25/100), which is excellent! Keep maintaining that discipline.";
    }
    
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('management')) {
      return "Your risk management score is 78/100 - quite good! Here are some areas for improvement: 1) Consider using a maximum daily loss limit, 2) Implement position sizing based on volatility, 3) Use trailing stops for winning trades, 4) Never risk more than 2% of your account on a single trade. Would you like specific strategies for any of these areas?";
    }
    
    if (lowerQuestion.includes('weakness') || lowerQuestion.includes('improve')) {
      return "Your biggest area for improvement appears to be overtrading, with a score of 45/100. This typically happens during high volatility periods when opportunities seem abundant. Try implementing a maximum number of trades per day and stick to your highest probability setups only. Quality over quantity is key!";
    }
    
    if (lowerQuestion.includes('position') || lowerQuestion.includes('sizing')) {
      return "Here are some effective position sizing strategies: 1) Fixed percentage (1-2% risk per trade), 2) Volatility-based sizing (smaller positions for volatile stocks), 3) Kelly Criterion for optimal sizing, 4) Equal dollar risk across all positions. Given your trading style, I'd recommend starting with fixed percentage risk of 1.5% per trade.";
    }
    
    return "That's an interesting question! As your AI trading assistant, I'm here to help you improve your trading performance through behavioral analysis and strategic insights. Could you be more specific about what aspect of trading you'd like to explore? I can analyze patterns, suggest improvements, or explain trading concepts.";
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="llm-page">
      {/* Header */}
      <div className="llm-header fade-in">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <MessageSquare size={32} />
              LLM Trading Assistant
            </h1>
            <p className="page-description">
              Get personalized trading insights and advice from our AI-powered assistant
            </p>
          </div>
          <div className="ai-status-badge">
            <Brain size={20} />
            <span>AI Assistant Online</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container card fade-in">
        {/* Messages */}
        <div className="messages-container">
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
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="suggested-questions">
            <h4>Try asking me:</h4>
            <div className="questions-grid">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="suggested-question"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <Lightbulb size={16} />
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your trading patterns, strategies, or get personalized advice..."
              className="message-input"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Features Info */}
      <div className="features-info fade-in">
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <TrendingUp size={24} />
            </div>
            <h4>Performance Analysis</h4>
            <p>Get detailed insights into your trading performance and behavioral patterns</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <AlertCircle size={24} />
            </div>
            <h4>Risk Assessment</h4>
            <p>Receive personalized risk management advice based on your trading history</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">
              <Zap size={24} />
            </div>
            <h4>Real-time Guidance</h4>
            <p>Get instant answers to your trading questions and strategic recommendations</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer card fade-in">
        <div className="disclaimer-content">
          <AlertCircle size={20} />
          <div className="disclaimer-text">
            <strong>Disclaimer:</strong> This AI assistant provides educational insights based on your trading data. 
            All advice should be considered as informational only and not as financial advice. 
            Always conduct your own research and consider consulting with a financial advisor.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMPage;

export default LLMPage