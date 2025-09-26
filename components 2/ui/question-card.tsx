'use client';

import * as React from 'react';
import { HelpCircle, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  isRecommended?: boolean;
  aiRecommendationReason?: string;
}

interface QuestionCardProps {
  question: string;
  description?: string;
  type: 'single' | 'multiple' | 'text' | 'textarea' | 'upload';
  options?: QuestionOption[];
  placeholder?: string;
  aiInsight?: string;
  confidenceScore?: number;
  showHelp?: boolean;
  onHelpRequest?: () => void;
  onAiChat?: () => void;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function QuestionCard({
  question,
  description,
  type,
  options,
  aiInsight,
  confidenceScore,
  showHelp = true,
  onHelpRequest,
  onAiChat,
  required = false,
  className,
  children
}: QuestionCardProps) {
  return (
    <Card className={cn('relative overflow-hidden border-2', className)}>
      {/* AI Confidence Indicator */}
      {confidenceScore && (
        <div
          className={cn(
            'absolute top-0 left-0 h-1 transition-all duration-500',
            confidenceScore >= 0.8
              ? 'bg-green-500'
              : confidenceScore >= 0.6
              ? 'bg-neutral-500'
              : 'bg-red-500'
          )}
          style={{ width: `${confidenceScore * 100}%` }}
        />
      )}

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {question}
              {required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm leading-relaxed">
                {description}
              </CardDescription>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showHelp && onHelpRequest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onHelpRequest}
                className="h-8 w-8 p-0"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Get help</span>
              </Button>
            )}
            {onAiChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAiChat}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">AI Chat</span>
              </Button>
            )}
          </div>
        </div>

        {/* AI Insight Panel */}
        {aiInsight && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary">AI Insight</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {aiInsight}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Options */}
        {options && options.some(opt => opt.isRecommended) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Recommended
            </p>
            <div className="flex flex-wrap gap-2">
              {options
                .filter(opt => opt.isRecommended)
                .map(option => (
                  <Badge
                    key={option.id}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {option.label}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

export function QuestionSection({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}