'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  StrategicQuestionResponse,
  BuyerPersona,
  MarketSegment,
} from '@/app/actions/businesses';
import {
  Brain,
  Lightbulb,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  HelpCircle,
  BookOpen,
  Save,
} from 'lucide-react';

interface StrategicQuestion {
  id: string;
  number: number;
  title: string;
  question: string;
  description: string;
  type: 'text' | 'textarea' | 'radio' | 'multi_select' | 'slider';
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

interface StrategicQuestionsFlowProps {
  selectedSegment: MarketSegment;
  selectedPersona: BuyerPersona;
  businessData: any;
  onQuestionsCompleted: (
    responses: Record<string, StrategicQuestionResponse>
  ) => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

export function StrategicQuestionsFlow({
  selectedSegment,
  selectedPersona,
  businessData,
  onQuestionsCompleted,
  onPrevious,
  isLoading = false,
}: StrategicQuestionsFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, StrategicQuestionResponse>
  >({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState<
    'low' | 'medium' | 'high'
  >('medium');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // The 15 strategic questions
  const questions: StrategicQuestion[] = [
    {
      id: '1',
      number: 1,
      title: 'The Expensive Problem',
      question: `What expensive problem does ${selectedPersona.name} face?`,
      description: 'Identify the costly pain point your solution addresses',
      type: 'textarea',
      placeholder:
        'Describe the specific problem that costs your customers money, time, or opportunities...',
      helpText:
        'Think about quantifiable losses, missed opportunities, or inefficiencies',
    },
    {
      id: '2',
      number: 2,
      title: 'The Category Context',
      question: `When ${selectedPersona.name} looks for solutions, what do they search for?`,
      description:
        'Understand how customers categorize and search for solutions like yours',
      type: 'text',
      placeholder:
        'e.g., marketing automation, business consulting, web development...',
      helpText: 'This puts you in competition with specific alternatives',
    },
    {
      id: '3',
      number: 3,
      title: 'The Hidden Obstacle',
      question: `What stops ${selectedPersona.name} from solving this themselves?`,
      description: 'Identify the barriers that prevent self-service solutions',
      type: 'multi_select',
      options: [
        "Don't know how",
        "Don't have time",
        'Too many options',
        'Wrong beliefs',
        'Lack resources',
        'Too risky',
        'Need expertise',
        'Complexity',
      ],
      helpText: 'Multiple barriers often exist - select all that apply',
    },
    {
      id: '4',
      number: 4,
      title: 'The Transformation Desired',
      question: `If this problem vanished, what would ${selectedPersona.name} achieve?`,
      description: 'Define the ultimate outcome or transformation',
      type: 'textarea',
      placeholder:
        'Describe the ideal future state when the problem is completely solved...',
      helpText: 'Focus on the end benefit, not just problem removal',
    },
    {
      id: '5',
      number: 5,
      title: 'Identity Markers',
      question: `How does ${selectedPersona.name} see themselves?`,
      description: 'Understand customer self-perception and identity',
      type: 'textarea',
      placeholder: 'They are the type of person who...',
      helpText: 'Consider values, aspirations, and professional identity',
    },
    {
      id: '6',
      number: 6,
      title: 'The Trigger Moment',
      question: `What happens right before ${selectedPersona.name} looks for you?`,
      description: 'Identify the catalyst moment that drives purchase intent',
      type: 'textarea',
      placeholder:
        'Describe the specific event or realization that triggers the search...',
      helpText: 'Think about timing and urgency factors',
    },
    {
      id: '7',
      number: 7,
      title: 'Your Core Identity',
      question: 'Complete: "We are the [role] who [unique action]"',
      description: 'Define your unique position and role in the market',
      type: 'text',
      placeholder: 'We are the strategists who work in real-time...',
      helpText: 'This becomes your category-defying positioning',
    },
    {
      id: '8',
      number: 8,
      title: 'Non-Negotiable Values',
      question: 'What will you ALWAYS do, even if costly?',
      description: 'Define your core values and principles',
      type: 'multi_select',
      options: [
        'Tell uncomfortable truths',
        'Put speed over perfection',
        'Choose simple over complex',
        'Prioritize long-term relationships',
        'Maintain high quality standards',
        'Be completely transparent',
        'Support clients beyond contract',
        'Challenge conventional thinking',
      ],
      helpText: 'These values differentiate you and attract aligned customers',
    },
    {
      id: '9',
      number: 9,
      title: 'Your Contrarian Belief',
      question:
        "What do you believe about solving this problem that others don't?",
      description: 'Identify your unique perspective or contrarian view',
      type: 'textarea',
      placeholder: 'While everyone believes X, we believe Y because...',
      helpText: 'This belief should challenge industry norms',
    },
    {
      id: '10',
      number: 10,
      title: 'Strategic Sacrifice',
      question: 'What part of the market will you deliberately NOT serve?',
      description: 'Define what you will exclude to strengthen your position',
      type: 'textarea',
      placeholder:
        "We deliberately don't serve X because it would prevent Y...",
      helpText: 'Strategic exclusions strengthen your positioning',
    },
    {
      id: '11',
      number: 11,
      title: 'Real Alternatives',
      question: `What would ${selectedPersona.name} do without you?`,
      description: 'Understand the competitive landscape and alternatives',
      type: 'textarea',
      placeholder: 'They would likely try to...',
      helpText: 'Include competitors, DIY options, and status quo',
    },
    {
      id: '12',
      number: 12,
      title: 'The Only Position',
      question: 'Complete: "We are the only ones who..."',
      description: 'Define your unique and defensible market position',
      type: 'text',
      placeholder: 'We are the only platform that...',
      helpText: 'This should be demonstrably true and hard to copy',
    },
    {
      id: '13',
      number: 13,
      title: 'Decision Driver',
      question: `What makes ${selectedPersona.name} choose YOU over alternatives?`,
      description: 'Identify the primary decision factors',
      type: 'radio',
      options: [
        'Rational (ROI, features, efficiency)',
        'Emotional (confidence, security, status)',
        'Social (reputation, recommendations, peer approval)',
        'Combination of all three',
      ],
      helpText: 'Understanding the primary driver shapes your sales approach',
    },
    {
      id: '14',
      number: 14,
      title: 'Unique Value Created',
      question: "What specific VALUE do you create that others can't?",
      description: 'Define measurable unique value proposition',
      type: 'textarea',
      placeholder:
        'We create X that is impossible with alternatives because...',
      helpText: 'Be specific and quantifiable where possible',
    },
    {
      id: '15',
      number: 15,
      title: 'Success Metrics',
      question: 'How will you measure winning?',
      description: 'Define clear success metrics and timeline',
      type: 'text',
      placeholder: 'We will achieve X by Y timeframe...',
      helpText: 'Make it specific and time-bound',
    },
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

  // Load existing response when question changes
  useEffect(() => {
    const existingResponse = responses[currentQ.id];
    if (existingResponse) {
      setCurrentAnswer(existingResponse.answer);
      setCurrentConfidence(existingResponse.confidence);
    } else {
      setCurrentAnswer('');
      setCurrentConfidence('medium');
    }
    setQuestionStartTime(Date.now());
    setAiSuggestion('');
  }, [currentQuestion, currentQ.id, responses]);

  const generateAISuggestion = async () => {
    setLoadingSuggestion(true);

    // Simulate AI suggestion generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate contextual suggestions based on question and persona
    const suggestions = {
      '1': `Based on ${selectedPersona.name} in ${selectedSegment.name}: They lose $${selectedSegment.name.includes('SaaS') ? '50-500K' : '10-100K'} annually because they can't differentiate effectively, leading to longer sales cycles and lower conversion rates.`,
      '2': `They typically search for "${businessData.industry?.toLowerCase()} consulting", "strategic positioning", or "competitive differentiation" solutions.`,
      '3': `Primary obstacles: Don't have strategic expertise in-house, too busy with day-to-day operations, overwhelmed by conflicting advice from different sources.`,
      '7': `We are the strategic positioning experts who deliver clarity in days not months.`,
      '12': `We are the only positioning platform that builds strategy AS you answer questions, not after months of analysis.`,
      '14': `We create strategic clarity in 15 minutes that typically takes consultants 3-6 months to deliver, using AI-powered analysis of your specific market context.`,
    };

    setAiSuggestion(
      suggestions[currentQ.id] ||
        'AI suggestion based on your persona and segment would appear here.'
    );
    setLoadingSuggestion(false);
  };

  const saveCurrentResponse = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer before continuing');
      return false;
    }

    const response: StrategicQuestionResponse = {
      answer: currentAnswer,
      confidence: currentConfidence,
      answered_at: new Date().toISOString(),
      ai_suggestions_used:
        aiSuggestion && currentAnswer.includes(aiSuggestion.substring(0, 50))
          ? [aiSuggestion]
          : [],
    };

    setResponses(prev => ({
      ...prev,
      [currentQ.id]: response,
    }));

    return true;
  };

  const handleNext = () => {
    if (!saveCurrentResponse()) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions completed
      const finalResponses = {
        ...responses,
        [currentQ.id]: {
          answer: currentAnswer,
          confidence: currentConfidence,
          answered_at: new Date().toISOString(),
          ai_suggestions_used:
            aiSuggestion &&
            currentAnswer.includes(aiSuggestion.substring(0, 50))
              ? [aiSuggestion]
              : [],
        },
      };
      onQuestionsCompleted(finalResponses);
    }
  };

  const handlePrevious = () => {
    saveCurrentResponse();
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const renderQuestionInput = () => {
    switch (currentQ.type) {
      case 'text':
        return (
          <Input
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder={currentQ.placeholder}
            className="text-base"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder={currentQ.placeholder}
            className="min-h-[120px] text-base resize-none"
          />
        );

      case 'radio':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={setCurrentAnswer}
            className="space-y-3"
          >
            {currentQ.options?.map(option => (
              <div
                key={option}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <RadioGroupItem value={option} id={option} />
                <Label
                  htmlFor={option}
                  className="cursor-pointer flex-1 font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi_select':
        const selectedOptions = currentAnswer
          ? currentAnswer.split(',').map(s => s.trim())
          : [];
        return (
          <div className="space-y-3">
            {currentQ.options?.map(option => (
              <div
                key={option}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedOptions.includes(option)}
                  onChange={e => {
                    let newSelected = [...selectedOptions];
                    if (e.target.checked) {
                      newSelected.push(option);
                    } else {
                      newSelected = newSelected.filter(s => s !== option);
                    }
                    setCurrentAnswer(newSelected.join(', '));
                  }}
                  className="rounded border-border"
                />
                <Label
                  htmlFor={option}
                  className="cursor-pointer flex-1 font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'slider':
        const sliderValue = currentAnswer ? parseInt(currentAnswer) : 5;
        return (
          <div className="space-y-4">
            <Slider
              value={[sliderValue]}
              onValueChange={value => setCurrentAnswer(value[0].toString())}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 (Low)</span>
              <span className="font-medium">{sliderValue}</span>
              <span>10 (High)</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {currentQ.number}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{currentQ.title}</h3>
              <p className="text-base font-medium text-primary mb-2">
                {currentQ.question}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentQ.description}
              </p>
            </div>
          </div>

          {currentQ.helpText && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 ml-11">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentQ.helpText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ml-11">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  AI Suggestion:
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {aiSuggestion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Input */}
        <div className="ml-11 space-y-4">
          {renderQuestionInput()}

          {/* Confidence Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Confidence Level:</Label>
            <RadioGroup
              value={currentConfidence}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                setCurrentConfidence(value)
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="conf-low" />
                <Label htmlFor="conf-low" className="cursor-pointer text-sm">
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="conf-medium" />
                <Label htmlFor="conf-medium" className="cursor-pointer text-sm">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="conf-high" />
                <Label htmlFor="conf-high" className="cursor-pointer text-sm">
                  High
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* AI Help Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAISuggestion}
              disabled={loadingSuggestion}
              className="flex items-center gap-2"
            >
              {loadingSuggestion ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Chat with AI
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={saveCurrentResponse}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Progress
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {currentQuestion === 0 ? 'Back to Personas' : 'Previous Question'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={isLoading || !currentAnswer.trim()}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : currentQuestion === questions.length - 1 ? (
            <>
              Generate Positioning
              <CheckCircle className="h-4 w-4" />
            </>
          ) : (
            <>
              Next Question
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
