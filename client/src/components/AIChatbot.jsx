import { useState, useContext } from 'react';
import { chatAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AIChatbot = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m Dr. AI, your medical assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send message along with conversation history
      const conversationHistory = newMessages
        .slice(1) // Skip the welcome message
        .map(msg => ({ role: msg.role, content: msg.content }));

      const res = await chatAPI.ask(input, conversationHistory);
      const botMsg = { role: 'assistant', content: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error", err);
      const errorMsg = { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't show chatbot if user is not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 group"
          aria-label="Open AI Chatbot"
        >
          <span className="text-2xl">💬</span>
          <span className="hidden group-hover:inline-block pr-2 font-semibold">Dr. AI</span>
        </button>
      )}

      {isOpen && (
        <div className="w-96 h-[32rem] bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold">Dr. AI</h3>
                <p className="text-xs text-primary-100">Medical Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary-800 rounded-full p-1 transition"
              aria-label="Close chatbot"
            >
              ✖
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea 
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about medications, symptoms..."
                disabled={loading}
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-primary-600 text-white px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Always consult a real doctor for medical advice
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
