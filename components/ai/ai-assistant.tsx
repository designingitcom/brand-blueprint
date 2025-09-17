'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/use-ai';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { loading, models, generateContent, getAvailableModels } = useAI();

  useEffect(() => {
    getAvailableModels();
  }, [getAvailableModels]);

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await generateContent(input, '', selectedModel);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle>AI Brand Assistant</CardTitle>
          </div>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <p className="font-semibold text-foreground">
                AI Brand Assistant
              </p>
              <p className="text-sm text-muted-foreground">
                I can help with brand strategy, content creation, and
                consistency analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
              <button
                onClick={() =>
                  setInput('Help me define my brand identity and core values')
                }
                className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm font-medium">Brand Identity</p>
                <p className="text-xs text-muted-foreground">
                  Define core values & mission
                </p>
              </button>

              <button
                onClick={() =>
                  setInput('Create a brand color palette and style guide')
                }
                className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <p className="text-sm font-medium">Brand Guidelines</p>
                <p className="text-xs text-muted-foreground">
                  Colors, fonts & styling
                </p>
              </button>

              <button
                onClick={() =>
                  setInput('Generate content ideas for social media campaign')
                }
                className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <p className="text-sm font-medium">Content Strategy</p>
                <p className="text-xs text-muted-foreground">
                  Social media & campaigns
                </p>
              </button>

              <button
                onClick={() =>
                  setInput('Analyze my brand consistency across platforms')
                }
                className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <p className="text-sm font-medium">Brand Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Consistency & optimization
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about brand strategy, content creation, or analysis..."
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
