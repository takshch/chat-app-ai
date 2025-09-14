import axios from 'axios';
import { env } from '../config/env.ts';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMService {
  private apiKey: string | null = null;
  private model: string | null = null;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    // Lazy initialization - will be set when first used
  }

  private initialize() {
    this.apiKey = env.OPENROUTER_API_KEY || null;
    this.model = env.OPENROUTER_MODEL;
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    this.initialize();
    
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000', // Optional: for tracking
            'X-Title': 'ViralLens Chat', // Optional: for tracking
          },
        }
      );

      const choice = response.data.choices[0];
      if (!choice || !choice.message) {
        throw new Error('Invalid response from OpenRouter API');
      }

      return {
        content: choice.message.content,
        usage: response.data.usage,
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        
        if (status === 401) {
          throw new Error('Invalid OpenRouter API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 402) {
          throw new Error('Insufficient credits. Please check your OpenRouter account.');
        } else {
          throw new Error(`OpenRouter API error: ${message}`);
        }
      }
      
      throw new Error('Failed to generate response from LLM');
    }
  }

  async generateChatResponse(userMessage: string, chatHistory: LLMMessage[] = []): Promise<string> {
    // Prepare messages for the API
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions.'
      },
      ...chatHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await this.generateResponse(messages);
    return response.content;
  }
}

// Export singleton instance
export const llmService = new LLMService();
