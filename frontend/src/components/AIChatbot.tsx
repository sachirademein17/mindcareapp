import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader, Bot, User, AlertTriangle, Star, Calendar, MapPin, Award, Clock, Phone, Stethoscope } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  email?: string;
  location: string;
  specialization?: string;
  consultationFee?: number;
  avgRating: number;
  totalReviews: number;
  recommendPercent?: number;
  categoryRatings?: {
    communication: number;
    professionalism: number;
    knowledge: number;
  };
  nextAvailable?: string;
  nextAvailableDetails?: {
    day: string;
    time: string;
    date: string;
    daysFromNow: number;
  };
  hasAvailability: boolean;
  totalAvailableSlots?: number;
  languages?: string[];
}

interface ActionButton {
  text: string;
  action: string;
  doctorId?: number;
  priority?: 'high' | 'medium' | 'low' | 'critical';
  available?: boolean;
  nextSlot?: any;
}

interface EmergencyInfo {
  crisis: string;
  emergency: string;
  text: string;
  international?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
  suggestions?: string[];
  doctors?: Doctor[];
  actionButtons?: ActionButton[];
  emergencyInfo?: EmergencyInfo;
  aiEnhanced?: boolean;
  searchCriteria?: any;
}



interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chatbot opens
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: '👋 Hello! I\'m here to help you with your mental health journey. You can ask me basic questions and I\'ll guide you to the right resources. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
        suggestions: ['Find a doctor', 'Get support', 'Ask a question', 'Contact help'],
        aiEnhanced: false
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getSimpleResponse = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return '👋 Hello! I\'m here to help you with your mental health needs. How can I assist you today?';
    }
    
    if (lowerMsg.includes('doctor') || lowerMsg.includes('appointment')) {
      return '🏥 I can help you find doctors and schedule appointments. Please use our main booking system to find available doctors and book consultations.';
    }
    
    if (lowerMsg.includes('help') || lowerMsg.includes('support')) {
      return '💙 I\'m here to provide support. If you need immediate help, please contact our support team or use the emergency resources available on our platform.';
    }
    
    if (lowerMsg.includes('emergency') || lowerMsg.includes('crisis')) {
      return '🚨 If you\'re experiencing a mental health crisis, please contact emergency services immediately or reach out to a crisis helpline. Your safety is our priority.';
    }
    
    return '💭 Thank you for your message. I\'m a basic chatbot assistant. For comprehensive support, please explore our platform\'s features or contact our support team.';
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simple mock response for basic chatbot functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: getSimpleResponse(text),
          isUser: false,
          timestamp: new Date(),
          suggestions: ['Tell me more', 'Find a doctor', 'Get support'],
          doctors: [],
          actionButtons: [],
          aiEnhanced: false
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        setIsTyping(false);
      }, 500); // Small delay to simulate typing

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: '❌ Sorry, I\'m having trouble right now. Please try again later or contact support.',
        isUser: false,
        timestamp: new Date(),
        suggestions: ['Try again', 'Contact support'],
        aiEnhanced: false
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Mental Health Assistant</h3>
              <p className="text-blue-100 text-sm">Here to help and guide you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%]`}>
                {!message.isUser && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  
                  {/* Emergency info */}
                  {message.emergencyInfo && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center text-red-600 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Emergency Resources Available
                      </div>
                    </div>
                  )}

                  {/* AI Enhancement indicator */}
                  {message.aiEnhanced && !message.isUser && (
                    <div className="mt-1 text-xs text-purple-500 flex items-center">
                      <Bot className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Doctor results */}
                  {message.doctors && message.doctors.length > 0 && (
                    <div className="mt-3 space-y-3">
                      <div className="text-sm font-medium text-blue-600 mb-2">
                        🏥 Found {message.doctors.length} doctor(s) near you
                      </div>
                      
                      {message.doctors.slice(0, 3).map((doctor: Doctor, index: number) => (
                        <div key={doctor.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                          {/* Doctor header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-5 w-5 text-blue-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900">Dr. {doctor.name}</h4>
                                <p className="text-sm text-gray-600">{doctor.specialization || 'General Mental Health'}</p>
                              </div>
                            </div>
                            {index === 0 && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Top Match
                              </span>
                            )}
                          </div>

                          {/* Rating and reviews */}
                          {doctor.totalReviews > 0 && (
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(doctor.avgRating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-medium text-gray-700">
                                  {doctor.avgRating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                ({doctor.totalReviews} reviews)
                              </span>
                              {doctor.recommendPercent && doctor.recommendPercent > 0 && (
                                <span className="text-sm text-green-600">
                                  {doctor.recommendPercent}% recommend
                                </span>
                              )}
                            </div>
                          )}

                          {/* Location and availability */}
                          <div className="grid grid-cols-1 gap-2 mb-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{doctor.location}</span>
                            </div>
                            
                            {doctor.nextAvailable && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 font-medium">
                                  Next available: {doctor.nextAvailable}
                                </span>
                              </div>
                            )}
                            
                            {doctor.consultationFee && doctor.consultationFee > 0 && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Award className="h-4 w-4" />
                                <span>${doctor.consultationFee}/session</span>
                              </div>
                            )}
                          </div>

                          {/* Quick stats for top doctor */}
                          {index === 0 && doctor.categoryRatings && (
                            <div className="bg-white/60 rounded p-2 mb-3">
                              <div className="text-xs text-gray-600 mb-1">Patient feedback:</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-medium text-blue-600">
                                    {doctor.categoryRatings.communication.toFixed(1)}
                                  </div>
                                  <div className="text-gray-500">Communication</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-purple-600">
                                    {doctor.categoryRatings.professionalism.toFixed(1)}
                                  </div>
                                  <div className="text-gray-500">Professional</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-green-600">
                                    {doctor.categoryRatings.knowledge.toFixed(1)}
                                  </div>
                                  <div className="text-gray-500">Knowledge</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex space-x-2">
                            {doctor.hasAvailability ? (
                              <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Book Now</span>
                              </button>
                            ) : (
                              <button className="flex-1 bg-gray-500 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Request Consultation</span>
                              </button>
                            )}
                            <button className="bg-white border border-blue-600 text-blue-600 text-sm py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {message.doctors.length > 3 && (
                        <div className="text-center">
                          <button className="text-blue-600 text-sm hover:underline">
                            View all {message.doctors.length} doctors →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message.isUser && (
                  <div className="bg-blue-600 rounded-full p-1 mt-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Always here to help • Contact support for urgent needs
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
