import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { sendToLindyWebhook, BusinessBasics } from '@/lib/lindy-webhook';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useQ7Suggestions(projectId: string) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for Lindy responses
  useEffect(() => {
    const subscription = supabase
      .channel('ai_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_messages',
        filter: `project_id=eq.${projectId} AND question_id=eq.Q7`
      }, (payload) => {
        console.log('🎉 Got Q7 suggestions:', payload.new);
        setSuggestions((payload.new as any).variants || []);
        setIsLoading(false);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  const triggerQ7Generation = async (businessBasics: BusinessBasics) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store job in Supabase
      const { error: jobError } = await supabase
        .from('ai_jobs')
        .insert({
          project_id: projectId,
          job_type: 'q7_suggestions',
          payload: businessBasics,
          webhook_url: process.env.NEXT_PUBLIC_LINDY_WEBHOOK_URL,
          idempotency_key: `q7-${projectId}-${Date.now()}`
        });

      if (jobError) throw jobError;

      // Send to Lindy webhook
      const result = await sendToLindyWebhook(
        projectId,
        businessBasics,
        process.env.NEXT_PUBLIC_LINDY_WEBHOOK_URL!
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Loading state will be cleared by the subscription

    } catch (err) {
      console.error('❌ Q7 generation failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  return {
    suggestions,
    isLoading,
    error,
    triggerQ7Generation
  };
}
