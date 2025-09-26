'use client';

import * as React from 'react';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Textarea } from './textarea';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

interface AiChatBubbleProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading?: boolean;
  contextInfo?: string;
  suggestedPrompts?: string[];
  className?: string;
}

export function AiChatBubble({
  isOpen,
  onClose,
  onSendMessage,
  messages,
  isLoading = false,
  contextInfo,
  suggestedPrompts = [],
  className
}: AiChatBubbleProps) {
  const [inputMessage, setInputMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await onSendMessage(message);
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    await onSendMessage(prompt);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {}}
        size="sm"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="sr-only">Open AI Chat</span>
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col',
        'border-2 border-primary/20',
        className
      )}
    >
      <CardHeader className="flex-shrink-0 pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            AI Assistant
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {contextInfo && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            Context: {contextInfo}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4">
          {messages.length === 0 && (
            <div className="text-center space-y-4 py-8">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">How can I help?</p>
                <p className="text-xs text-muted-foreground">
                  Ask me questions about this step or get personalized
                  recommendations.
                </p>
              </div>
            </div>
          )}

          {messages.map(message => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length === 0 && suggestedPrompts.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground">Quick questions:</p>
            <div className="space-y-1">
              {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="w-full justify-start text-left h-auto p-2 text-xs"
                  disabled={isLoading}
                >
                  <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
        )}
      >
        {isUser ? (
          <User className="h-3 w-3" />
        ) : (
          <Bot className="h-3 w-3 text-primary" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {!isUser && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Helpful
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              Not helpful
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Confidence Slider Component
export function ConfidenceSlider({
  value,
  onChange,
  label = 'Confidence Level',
  className
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Badge
          variant="secondary"
          className={cn(
            value >= 0.8
              ? 'bg-green-100 text-green-800'
              : value >= 0.6
              ? 'bg-neutral-100 text-neutral-800'
              : 'bg-red-100 text-red-800'
          )}
        >
          {Math.round(value * 100)}%
        </Badge>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
        <div
          className="absolute top-0 left-0 h-2 bg-primary rounded-lg pointer-events-none"
          style={{ width: `${value * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Not confident</span>
        <span>Very confident</span>
      </div>
    </div>
  );
}