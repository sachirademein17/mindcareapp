import React, { useState } from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import AIChatbot from './AIChatbot';

const ChatbotButton: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Floating chatbot button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-40"
        aria-label="Open AI Chatbot"
      >
        <div className="relative">
          {isChatbotOpen ? (
            <Bot className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          
          {/* Notification pulse */}
          {!isChatbotOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              AI
            </div>
          )}
        </div>
      </button>

      {/* Chatbot modal */}
      <AIChatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </>
  );
};

export default ChatbotButton;
