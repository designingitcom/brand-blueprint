import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AIModel {
  id: string;
  name: string;
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);

  const generateContent = useCallback(
    async (
      prompt: string,
      context?: string,
      model?: string
    ): Promise<string> => {
      setLoading(true);
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateContent',
            data: { prompt, context, model },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate content');
        }

        const { content } = await response.json();
        return content;
      } catch (error) {
        console.error('AI generation error:', error);
        toast.error('Failed to generate content');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const analyzeBrandConsistency = useCallback(
    async (content: string, guidelines: string): Promise<string> => {
      setLoading(true);
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyzeBrandConsistency',
            data: { content, guidelines },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze content');
        }

        const { analysis } = await response.json();
        return analysis;
      } catch (error) {
        console.error('AI analysis error:', error);
        toast.error('Failed to analyze content');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateBrandStrategy = useCallback(
    async (businessInfo: any, targetAudience: string): Promise<string> => {
      setLoading(true);
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateStrategy',
            data: { businessInfo, targetAudience },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate strategy');
        }

        const { strategy } = await response.json();
        return strategy;
      } catch (error) {
        console.error('AI strategy error:', error);
        toast.error('Failed to generate strategy');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getAvailableModels = useCallback(async (): Promise<AIModel[]> => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getModels',
          data: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get models');
      }

      const { models } = await response.json();
      setModels(models);
      return models;
    } catch (error) {
      console.error('Failed to get AI models:', error);
      toast.error('Failed to load AI models');
      return [];
    }
  }, []);

  return {
    loading,
    models,
    generateContent,
    analyzeBrandConsistency,
    generateBrandStrategy,
    getAvailableModels,
  };
}
