import { useState } from 'react'
import { Bot, Heart, Shield, Users, MessageCircle } from 'lucide-react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <Heart className="h-12 w-12 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-800">MindCare</h1>
            <Bot className="h-12 w-12 text-blue-500" />
          </div>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Mental Health Platform with Google Gemini Integration
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              🤖 AI Chatbot Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">AI Conversations</h3>
                <p className="text-gray-600 text-sm">
                  Powered by Google Gemini for intelligent, empathetic responses
                </p>
              </div>
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Doctor Finding</h3>
                <p className="text-gray-600 text-sm">
                  Smart doctor recommendations based on your needs
                </p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Crisis Support</h3>
                <p className="text-gray-600 text-sm">
                  24/7 emergency detection and intervention resources
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Try the AI Chatbot
          </h3>
          <p className="text-gray-600 mb-6">
            Click the floating chatbot button in the bottom-right corner to start a conversation with our AI assistant!
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Sample Questions to Try:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• "I'm feeling anxious and need help"</li>
              <li>• "Find me a therapist in Colombo"</li>
              <li>• "What are the consultation fees?"</li>
              <li>• "I need someone to talk to"</li>
              <li>• "Book an appointment for next week"</li>
            </ul>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Demo Counter: {count} clicks
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Bot className="h-10 w-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">AI Assistant</h3>
            <p className="text-gray-600 text-sm">
              Google Gemini powered conversations
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Heart className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Mental Health</h3>
            <p className="text-gray-600 text-sm">
              Specialized mental health support
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Find Doctors</h3>
            <p className="text-gray-600 text-sm">
              Connect with qualified professionals
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Shield className="h-10 w-10 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">
              Always available crisis intervention
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Ready to get started? Use the AI chatbot below! 👇
          </p>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-700">
              Look for the floating 
              <MessageCircle className="inline h-4 w-4 mx-1 text-blue-600" />
              button in the bottom-right corner
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
