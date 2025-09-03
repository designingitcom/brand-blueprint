export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not configured');
    }
  }

  async sendMessage(
    messages: OpenRouterMessage[],
    model: string = 'meta-llama/llama-3.2-90b-text-preview',
    temperature: number = 0.7
  ): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'S1BMW Brand Management',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenRouter service error:', error);
      throw error;
    }
  }

  async generateBrandContent(
    prompt: string,
    context: string = '',
    model?: string
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'You are an expert brand strategist and content creator. Provide professional, creative, and actionable brand guidance.',
      },
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Brand Context: ${context}`,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const response = await this.sendMessage(messages, model);
    return response.choices[0]?.message.content || '';
  }

  async analyzeBrandConsistency(
    content: string,
    guidelines: string
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'You are a brand consistency analyst. Evaluate content against brand guidelines and provide detailed feedback.',
      },
      {
        role: 'user',
        content: `
          Brand Guidelines:
          ${guidelines}
          
          Content to Analyze:
          ${content}
          
          Please provide a detailed analysis of brand consistency, highlighting any deviations and suggestions for improvement.
        `,
      },
    ];

    const response = await this.sendMessage(messages);
    return response.choices[0]?.message.content || '';
  }

  async generateBrandStrategy(
    businessInfo: any,
    targetAudience: string
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'You are an expert brand strategist. Create comprehensive brand strategies based on business information and target audience.',
      },
      {
        role: 'user',
        content: `
          Business Information:
          - Name: ${businessInfo.name}
          - Industry: ${businessInfo.industry}
          - Values: ${businessInfo.values?.join(', ')}
          - Mission: ${businessInfo.mission}
          
          Target Audience: ${targetAudience}
          
          Please provide a comprehensive brand strategy including positioning, messaging, visual identity recommendations, and implementation plan.
        `,
      },
    ];

    const response = await this.sendMessage(messages);
    return response.choices[0]?.message.content || '';
  }

  // Helper method to get available models
  getAvailableModels() {
    return [
      { id: 'meta-llama/llama-3.2-90b-text-preview', name: 'Llama 3.2 90B' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ];
  }
}

// Singleton instance
export const openRouterService = new OpenRouterService();