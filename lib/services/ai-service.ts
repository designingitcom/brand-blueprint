// AI Service for OpenRouter integration
// This connects to your n8n webhook or directly to OpenRouter

interface AIResponse {
  content: string;
  error?: string;
}

interface AIRequest {
  prompt: string;
  context?: {
    question?: string;
    currentAnswer?: string;
    businessContext?: any;
    framework?: string;
  };
  maxTokens?: number;
  temperature?: number;
}

export class AIService {
  private baseUrl: string;
  private apiKey: string;
  private useN8n: boolean;

  constructor() {
    // Check if we should use n8n or direct OpenRouter
    this.useN8n = process.env.NEXT_PUBLIC_AI_ROUTER === 'n8n';
    this.baseUrl = this.useN8n
      ? process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''
      : 'https://openrouter.ai/api/v1/chat/completions';
    this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      if (this.useN8n) {
        return await this.callN8nWebhook(request);
      } else {
        return await this.callOpenRouter(request);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  private async callN8nWebhook(request: AIRequest): Promise<AIResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'workshop_assistant',
        prompt: request.prompt,
        context: request.context,
        maxTokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`N8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.response || data.content || '',
      error: data.error,
    };
  }

  private async callOpenRouter(request: AIRequest): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(request.context);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'BrandBlueprint Workshop',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API failed: ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
    };
  }

  private buildSystemPrompt(context?: AIRequest['context']): string {
    let prompt = `You are an AI Brand Strategist helping users build their brand purpose and strategy. 
You provide clear, actionable guidance based on proven brand strategy frameworks.`;

    if (context?.question) {
      prompt += `\n\nCurrent Question: ${context.question}`;
    }

    if (context?.currentAnswer) {
      prompt += `\n\nUser's Current Answer: ${context.currentAnswer}`;
    }

    if (context?.framework) {
      prompt += `\n\nFramework Context: ${context.framework}`;
    }

    prompt += `\n\nProvide helpful suggestions that:
- Are specific and actionable
- Build on what the user has already written
- Use examples when helpful
- Stay concise and focused
- Encourage clarity and authenticity`;

    return prompt;
  }

  // Specific workshop assistant methods
  async suggestPurposeFramework(currentAnswer: string): Promise<AIResponse> {
    return this.generateResponse({
      prompt: `Based on this draft purpose statement, suggest improvements using Simon Sinek's "Why" framework: "${currentAnswer}"`,
      context: {
        framework: 'Simon Sinek Why Framework',
        currentAnswer,
      },
    });
  }

  async showIndustryExamples(
    industry: string,
    questionType: string
  ): Promise<AIResponse> {
    return this.generateResponse({
      prompt: `Show 3 excellent examples of ${questionType} from successful ${industry} brands. Make them relevant and inspiring.`,
      context: {
        framework: 'Industry Best Practices',
      },
    });
  }

  async askGuidingQuestions(
    question: string,
    currentAnswer: string
  ): Promise<AIResponse> {
    return this.generateResponse({
      prompt: `Based on this answer, ask 3-5 probing questions that will help deepen and clarify their response: "${currentAnswer}"`,
      context: {
        question,
        currentAnswer,
      },
    });
  }

  async reviewDraft(
    question: string,
    currentAnswer: string
  ): Promise<AIResponse> {
    return this.generateResponse({
      prompt: `Review this answer and provide specific feedback on clarity, completeness, and authenticity. Suggest 2-3 specific improvements: "${currentAnswer}"`,
      context: {
        question,
        currentAnswer,
      },
    });
  }

  async generateDraftAnswer(
    question: string,
    businessContext: any
  ): Promise<AIResponse> {
    return this.generateResponse({
      prompt: `Generate a draft answer for this brand strategy question based on the business context provided. Make it authentic and specific to their business: "${question}"`,
      context: {
        question,
        businessContext,
      },
      temperature: 0.8,
    });
  }
}

// Export singleton instance
export const aiService = new AIService();
