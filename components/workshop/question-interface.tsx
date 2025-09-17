'use client';

import { useState, useEffect } from 'react';
import { useWorkshopStore } from '@/lib/store/workshop-store';
import { aiService } from '@/lib/services/ai-service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Lightbulb,
  MessageSquare,
  Target,
  Sparkles,
  Info,
  Users,
  FileText,
  Brain,
  X,
  Send,
  Loader2,
} from 'lucide-react';

export function QuestionInterface() {
  const {
    getCurrentQuestion,
    getLatestAnswer,
    saveAnswer,
    navigateNext,
    navigatePrevious,
    aiPanelOpen,
    toggleAIPanel,
    aiHistory,
    addAIMessage,
  } = useWorkshopStore();

  const [answerContent, setAnswerContent] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiInput, setAIInput] = useState('');

  const currentQuestion = getCurrentQuestion();
  const latestAnswer = currentQuestion
    ? getLatestAnswer(currentQuestion.id)
    : null;

  // Load existing answer when question changes
  useEffect(() => {
    if (latestAnswer) {
      setAnswerContent(latestAnswer.content);
      setConfidence(latestAnswer.confidence);
    } else {
      setAnswerContent('');
      setConfidence(5);
    }
  }, [currentQuestion?.id, latestAnswer]);

  const handleSave = async (status: 'draft' | 'approved' = 'draft') => {
    if (!currentQuestion || !answerContent.trim()) return;

    setIsSaving(true);
    await saveAnswer(currentQuestion.id, answerContent, confidence);
    setIsSaving(false);

    if (status === 'approved') {
      // TODO: Call backend to save approved answer
    }
  };

  const handleAIAssist = async (action: string) => {
    if (!currentQuestion) return;

    setIsAILoading(true);
    addAIMessage('user', action);

    let response;
    switch (action) {
      case 'framework':
        response = await aiService.suggestPurposeFramework(answerContent);
        break;
      case 'examples':
        response = await aiService.showIndustryExamples(
          '',
          currentQuestion.title
        );
        break;
      case 'questions':
        response = await aiService.askGuidingQuestions(
          currentQuestion.title,
          answerContent
        );
        break;
      case 'review':
        response = await aiService.reviewDraft(
          currentQuestion.title,
          answerContent
        );
        break;
      default:
        response = await aiService.generateResponse({
          prompt: action,
          context: {
            question: currentQuestion.title,
            currentAnswer: answerContent,
          },
        });
    }

    if (response.content) {
      addAIMessage('assistant', response.content);
    }

    setIsAILoading(false);
  };

  const handleAIChat = async () => {
    if (!aiInput.trim() || !currentQuestion) return;

    const message = aiInput;
    setAIInput('');
    setIsAILoading(true);

    addAIMessage('user', message);

    const response = await aiService.generateResponse({
      prompt: message,
      context: {
        question: currentQuestion.title,
        currentAnswer: answerContent,
      },
    });

    if (response.content) {
      addAIMessage('assistant', response.content);
    }

    setIsAILoading(false);
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No question selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Question Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{currentQuestion.title}</h1>
          {currentQuestion.description && (
            <p className="text-muted-foreground">
              {currentQuestion.description}
            </p>
          )}
        </div>

        {/* 6-Question Framework */}
        <div className="space-y-4 mb-8">
          {/* Definition */}
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Definition</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentQuestion.description ||
                'Your brand purpose is the fundamental reason your company exists beyond making money.'}
            </p>
          </div>

          {/* Examples */}
          {currentQuestion.examples && currentQuestion.examples.length > 0 && (
            <div className="bg-card rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <h3 className="font-semibold">Examples</h3>
              </div>
              <ul className="text-sm space-y-1">
                {currentQuestion.examples.map((example, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span className="text-muted-foreground">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why It Matters */}
          {currentQuestion.whyItMatters && (
            <div className="bg-card rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-yellow-500" />
                <h3 className="font-semibold">Why It Matters</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.whyItMatters}
              </p>
            </div>
          )}

          {/* Additional Framework Sections */}
          {currentQuestion.framework && (
            <>
              {/* Kid-Friendly Version */}
              {currentQuestion.framework.kidFriendly && (
                <div className="bg-card rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold">In Other Words</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.framework.kidFriendly}
                  </p>
                </div>
              )}

              {/* Alternative Formats */}
              {currentQuestion.framework.alternativeFormats && (
                <div className="bg-card rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <h3 className="font-semibold">Alternative Formats</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    {currentQuestion.framework.alternativeFormats.map(
                      (format, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          <span className="text-muted-foreground">
                            {format}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Confidence Calibration */}
              <div className="bg-card rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Confidence Calibration</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  How confident are you in your answer?
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={confidence}
                    onChange={e => setConfidence(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-semibold text-primary min-w-[3ch]">
                    {confidence}/10
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Answer Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2">
            Your Answer:
          </label>
          <textarea
            value={answerContent}
            onChange={e => setAnswerContent(e.target.value)}
            placeholder="Describe your brand's fundamental purpose and how it aligns with your leadership's beliefs..."
            className="w-full h-48 p-4 bg-card border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={navigatePrevious}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isSaving || !answerContent.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>

            <Button
              onClick={navigateNext}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-screen w-96 bg-card border-l border-border transition-transform duration-300 z-40',
          aiPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* AI Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">AI Brand Strategist</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleAIPanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* AI Suggestions */}
          <div className="p-4 space-y-2 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => handleAIAssist('framework')}
              disabled={isAILoading}
            >
              <Lightbulb className="h-3 w-3" />
              Suggest Purpose Framework
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => handleAIAssist('examples')}
              disabled={isAILoading}
            >
              <Sparkles className="h-3 w-3" />
              Show Industry Examples
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => handleAIAssist('questions')}
              disabled={isAILoading}
            >
              <MessageSquare className="h-3 w-3" />
              Ask Guiding Questions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => handleAIAssist('review')}
              disabled={isAILoading || !answerContent}
            >
              <Target className="h-3 w-3" />
              Review My Draft
            </Button>
          </div>

          {/* AI Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiHistory.map(message => (
              <div
                key={message.id}
                className={cn(
                  'rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-secondary mr-8'
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {isAILoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </div>

          {/* AI Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={e => setAIInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAIChat()}
                placeholder="Ask AI anything..."
                className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isAILoading}
              />
              <Button
                size="icon"
                onClick={handleAIChat}
                disabled={isAILoading || !aiInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle AI Panel Button (when closed) */}
      {!aiPanelOpen && (
        <Button
          className="fixed right-4 top-20 z-30"
          size="icon"
          onClick={toggleAIPanel}
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
