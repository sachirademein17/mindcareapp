// 🧠 Google Gemini AI Service for Mental Health Chatbot
// Advanced conversational AI with mental health specialization

import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface ConversationContext {
  userId?: number;
  userLocation?: string;
  preferredLanguage?: string;
  previousMessages?: string[];
  currentTopic?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
  
  // 🎯 Generate context-aware mental health responses
  async generateMentalHealthResponse(
    userMessage: string, 
    context: ConversationContext = {},
    config: GeminiConfig = {}
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(userMessage, context);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent(fullPrompt);
      return result.response.text().trim();
      
    } catch (error) {
      console.error('🚨 Gemini AI Error:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }
  
  // 🔍 Analyze user intent with AI
  async analyzeIntent(userMessage: string): Promise<string> {
    try {
      const prompt = `
Analyze this mental health platform user message and determine the primary intent.

User message: "${userMessage}"

Available intents:
- find_doctor: User wants to find/search for mental health professionals
- check_availability: User wants to know doctor availability/scheduling  
- doctor_ratings: User wants information about doctor reviews/ratings
- emergency: User is in crisis or needs immediate mental health help
- appointment_booking: User wants to book/schedule an appointment
- mental_health_support: User needs emotional support or counseling advice
- general_conversation: General chat, greetings, or unclear intent

Respond with ONLY the intent name, no explanations.`;

      const result = await this.model.generateContent(prompt);
      const intent = result.response.text().trim().toLowerCase();
      
      const validIntents = [
        'find_doctor', 'check_availability', 'doctor_ratings', 'emergency',
        'appointment_booking', 'mental_health_support', 'general_conversation'
      ];
      
      return validIntents.includes(intent) ? intent : 'general_conversation';
      
    } catch (error) {
      console.error('Intent analysis failed:', error);
      return 'general_conversation';
    }
  }
  
  // 📊 Extract structured information from user messages
  async extractInformation(userMessage: string, extractionType: string): Promise<any> {
    try {
      let prompt = '';
      
      switch (extractionType) {
        case 'doctor_search':
          prompt = `
Extract doctor search criteria from: "${userMessage}"

Return JSON with:
{
  "location": "extracted location or null",
  "specialty": "mental health specialty or null", 
  "condition": "specific condition mentioned or null",
  "urgency": "urgent/today/soon/normal",
  "budget": "cheap/affordable/expensive/not_mentioned"
}`;
          break;
          
        case 'doctor_name':
          prompt = `
Extract the doctor's name from: "${userMessage}"

Return just the name if mentioned, or "none" if no specific doctor mentioned.
Examples: "Dr. Smith" -> "Smith", "When is Sarah available?" -> "Sarah", "any doctor" -> "none"`;
          break;
          
        case 'emergency_assessment':
          prompt = `
Assess the urgency level of this mental health message: "${userMessage}"

Return JSON with:
{
  "urgencyLevel": "low/medium/high/critical",
  "crisisKeywords": ["list", "of", "concerning", "words"],
  "needsImmediate": true/false,
  "riskLevel": "minimal/moderate/high/severe"
}`;
          break;
      }
      
      const result = await this.model.generateContent(prompt);
      
      try {
        return JSON.parse(result.response.text());
      } catch {
        return result.response.text().trim();
      }
      
    } catch (error) {
      console.error('Information extraction failed:', error);
      return null;
    }
  }
  
  // 💬 Generate empathetic responses for mental health support
  async generateEmpathyResponse(userMessage: string, context: ConversationContext = {}): Promise<string> {
    const empathyPrompt = `
You are a compassionate mental health support assistant. A person said: "${userMessage}"

Generate a warm, empathetic response that:
1. Validates their feelings without being dismissive
2. Shows understanding and compassion  
3. Offers hope and encouragement
4. Suggests appropriate professional help
5. Uses person-first, non-judgmental language
6. Maintains appropriate boundaries (you're not a therapist)

Context: ${context.currentTopic || 'general mental health concern'}
Location: ${context.userLocation || 'not specified'}

Keep response under 150 words. Be warm but professional.`;

    try {
      const result = await this.model.generateContent(empathyPrompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Empathy response generation failed:', error);
      return "I hear you, and what you're experiencing is valid. Mental health challenges are common and treatable. Professional support can provide personalized strategies to help you feel better. Remember, seeking help is a sign of strength, not weakness.";
    }
  }
  
  // 🚨 Generate crisis intervention responses
  async generateCrisisResponse(userMessage: string): Promise<{
    message: string;
    urgencyLevel: 'high' | 'critical';
    immediateActions: string[];
    resources: string[];
  }> {
    const crisisPrompt = `
A person in mental health crisis said: "${userMessage}"

Generate a crisis intervention response with:
1. Immediate empathetic acknowledgment
2. Clear safety prioritization
3. Specific crisis resources
4. Encouraging but urgent tone

Assess if this is HIGH urgency (distress, thoughts of harm) or CRITICAL (immediate danger, suicidal intent).

Respond in JSON format:
{
  "message": "empathetic crisis response under 100 words",
  "urgencyLevel": "high" or "critical", 
  "immediateActions": ["specific", "actions", "to", "take"],
  "resources": ["crisis", "hotline", "numbers", "and", "resources"]
}`;

    try {
      const result = await this.model.generateContent(crisisPrompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Crisis response generation failed:', error);
      return {
        message: "I'm very concerned about what you've shared. Your safety is the most important thing right now. Please reach out for immediate help.",
        urgencyLevel: 'critical',
        immediateActions: [
          'Call 988 (Suicide & Crisis Lifeline) immediately',
          'Call 911 if in immediate danger',
          'Reach out to a trusted person',
          'Go to nearest emergency room'
        ],
        resources: [
          '988 - National Suicide Prevention Lifeline',
          '911 - Emergency Services',
          'Text HOME to 741741 - Crisis Text Line'
        ]
      };
    }
  }
  
  // 🏗️ Build system prompt for mental health context
  private buildSystemPrompt(context: ConversationContext): string {
    return `
You are a helpful AI assistant for a mental health platform. Your role is to:

1. Provide supportive, professional responses about mental health services
2. Help users find appropriate mental health professionals  
3. Offer empathetic support while maintaining appropriate boundaries
4. Prioritize safety and crisis intervention when needed
5. Encourage professional treatment when appropriate

Guidelines:
- Be warm, empathetic, and non-judgmental
- Use person-first language 
- Validate feelings without minimizing concerns
- Clearly state you're not a replacement for professional therapy
- Always prioritize immediate safety in crisis situations
- Respect cultural and individual differences
- Maintain professional boundaries

Current conversation context:
- User location: ${context.userLocation || 'Not specified'}
- Language preference: ${context.preferredLanguage || 'English'}
- Current topic: ${context.currentTopic || 'General inquiry'}
- Previous context: ${context.previousMessages?.join(', ') || 'None'}

Remember: You provide information and support, but users should always consult mental health professionals for treatment.`;
  }
  
  // 👤 Build user-specific prompt
  private buildUserPrompt(userMessage: string, context: ConversationContext): string {
    return `
User message: "${userMessage}"

Please provide a helpful, empathetic response that addresses their needs while guiding them toward appropriate mental health resources and services available on our platform.

${context.urgencyLevel === 'critical' ? '⚠️ PRIORITY: This appears to be a crisis situation. Prioritize immediate safety resources.' : ''}
${context.urgencyLevel === 'high' ? '⚠️ ATTENTION: This may be urgent. Include crisis resources in your response.' : ''}`;
  }
  
  // 🛡️ Fallback response for AI failures
  private getFallbackResponse(userMessage: string, context: ConversationContext): string {
    if (this.containsCrisisKeywords(userMessage)) {
      return "I'm concerned about what you've shared. If you're having thoughts of self-harm, please reach out immediately: Call 988 (Suicide & Crisis Lifeline) or 911 for emergency help. Your safety matters.";
    }
    
    if (this.containsDoctorSearchKeywords(userMessage)) {
      return "I'd be happy to help you find a mental health professional. Let me search for doctors in your area who can provide the support you need.";
    }
    
    return "I'm here to help you with mental health support and finding the right professional care. Could you tell me a bit more about what you're looking for?";
  }
  
  // 🔍 Simple keyword detection helpers
  private containsCrisisKeywords(message: string): boolean {
    const crisisKeywords = [
      'suicide', 'suicidal', 'kill myself', 'end it all', 'don\'t want to live',
      'hopeless', 'can\'t go on', 'want to die', 'self harm', 'hurt myself'
    ];
    
    const msgLower = message.toLowerCase();
    return crisisKeywords.some(keyword => msgLower.includes(keyword));
  }
  
  private containsDoctorSearchKeywords(message: string): boolean {
    const searchKeywords = [
      'find doctor', 'find therapist', 'need help', 'looking for',
      'psychiatrist', 'psychologist', 'counselor', 'therapist'
    ];
    
    const msgLower = message.toLowerCase();
    return searchKeywords.some(keyword => msgLower.includes(keyword));
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIService();
