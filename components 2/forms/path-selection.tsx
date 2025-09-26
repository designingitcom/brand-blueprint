'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Target,
  Zap,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';

interface PathSelectionProps {
  onPathSelect: (path: 'strategic-foundation' | 'quick-start' | 'build-from-scratch') => void;
  onClose?: () => void;
}

export function PathSelection({ onPathSelect, onClose }: PathSelectionProps) {
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePathSelect = useCallback((pathId: 'strategic-foundation' | 'quick-start' | 'build-from-scratch') => {
    if (isProcessing) {
      console.log('Already processing, ignoring click');
      return; // Prevent double-clicks
    }

    console.log('Processing path selection:', pathId);
    setIsProcessing(true);

    // Use setTimeout to ensure state update happens before calling onPathSelect
    setTimeout(() => {
      onPathSelect(pathId);
      // Keep processing state for longer to prevent rapid clicks
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }, 0);
  }, [isProcessing, onPathSelect]);

  const paths = [
    {
      id: 'strategic-foundation' as const,
      title: 'Strategic Foundation',
      icon: Target,
      subtitle: 'Complete positioning strategy',
      shortDescription: 'Full strategic foundation with AI-powered insights and personalized activations.',
      time: '15 min',
      questions: '19 questions',
      perfectFor: [
        'Want maximum personalization',
        'Have 15 minutes to invest',
        'Ready for full platform potential'
      ],
      whatYouDo: [
        'Answer strategic questions about your business',
        'Select ideal segment and persona with AI',
        'Define unique value and positioning'
      ],
      whatYouGet: [
        { text: 'Full AI intelligence across all modules', type: 'success' as const },
        { text: 'Personalized activations that sound like you', type: 'success' as const },
        { text: 'Complete strategic positioning document', type: 'success' as const },
        { text: 'All platform features unlocked immediately', type: 'success' as const }
      ],
      whyChoose: 'Every minute invested saves hours later. Get 10x better activations and spot-on AI assistance.',
      buttonText: 'Start Strategic Foundation',
      recommended: true,
      callout: 'Recommended',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Replace with actual video URL
    },
    {
      id: 'quick-start' as const,
      title: 'Quick Start',
      icon: Zap,
      subtitle: 'Fast marketing activations',
      shortDescription: 'Basic setup to get started quickly with core activations.',
      time: '8 min',
      questions: '11 steps',
      perfectFor: [
        'Need help today',
        'Know your positioning',
        'Want to test platform'
      ],
      whatYouDo: [
        'Business basics (name, website, industry, LinkedIn)',
        'Pick segment and persona (3 AI options each)',
        'Answer 8 essential strategic questions'
      ],
      whatYouGet: [
        { text: 'Activations unlocked (80% effectiveness)', type: 'success' as const },
        { text: 'Essential AI context', type: 'success' as const },
        { text: 'Can upgrade anytime', type: 'success' as const },
        { text: 'Less personalization', type: 'warning' as const }
      ],
      whyChoose: 'Activations work at 80% effectiveness. You can complete full foundation later.',
      buttonText: 'Start Quick Start',
      recommended: false,
      callout: 'Fast Start',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Replace with actual video URL
    },
    {
      id: 'build-from-scratch' as const,
      title: 'Build From Scratch',
      icon: Building2,
      subtitle: 'Fresh start or rebrand',
      shortDescription: 'Step-by-step foundation building with full control over the process.',
      time: '2 min start',
      questions: '2-4 hours later',
      perfectFor: [
        'New business',
        'Complete rebrand',
        'Want full control'
      ],
      whatYouDo: [
        'Add basic business info',
        'Choose your starting point',
        'Build strategy step-by-step'
      ],
      whatYouGet: [
        { text: 'Access to all foundation modules', type: 'success' as const },
        { text: 'Choose your own path', type: 'success' as const },
        { text: 'No positioning assumptions', type: 'success' as const },
        { text: 'Activations locked initially', type: 'warning' as const }
      ],
      whyChoose: 'Complete Module 1 or Quick Onboarding before accessing marketing activations.',
      buttonText: 'Start From Scratch',
      recommended: false,
      callout: 'Fastest',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Replace with actual video URL
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[960px]">
          {/* Header */}
          <div className="relative text-center mb-12">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Close onboarding"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Choose Your Path to Strategic Clarity
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Select the approach that best fits your needs and timeline
            </p>

            {/* Video CTA - Prominent */}
            <div className="flex justify-center">
              <button
                onClick={() => setVideoModalOpen('overview')}
                className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg p-4 border border-border/50 inline-flex items-center gap-3 hover:from-muted/50 hover:to-muted/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg flex-shrink-0">
                  <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground whitespace-nowrap">
                      Not sure which path to choose?
                    </h3>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>2 min</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Watch this overview to understand your options
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Path Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {paths.map((path) => {
              const Icon = path.icon;
              return (
                <div
                  key={path.id}
                  className={cn(
                    "relative bg-card border rounded-xl p-6 transition-all hover:shadow-lg flex flex-col h-full",
                    path.recommended && "border-yellow-500/30 shadow-md"
                  )}
                >
                  <div className={cn(
                    "absolute -top-3 left-6 px-4 py-1 rounded-full text-sm font-medium",
                    path.recommended
                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      : path.callout === 'Activation'
                      ? "bg-muted-foreground text-background"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {path.callout}
                  </div>

                  <div className="flex-1 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-6 w-6", path.recommended ? "text-yellow-500" : "text-muted-foreground")} />
                        <div className="flex-1">
                          <h2 className="text-xl font-bold">{path.title}</h2>
                          <p className="text-sm text-muted-foreground">{path.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-sm text-muted-foreground">{path.shortDescription}</p>

                    {/* Time & Questions - Moved Up */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{path.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{path.questions}</span>
                      </div>
                    </div>

                    {/* Perfect For - Always Visible */}
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Perfect for:</h3>
                      <ul className="space-y-1">
                        {path.perfectFor.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Show/Hide Details Button */}
                    <button
                      onClick={() => {
                        if (expandedPaths.includes(path.id)) {
                          setExpandedPaths(expandedPaths.filter(id => id !== path.id));
                        } else {
                          setExpandedPaths([...expandedPaths, path.id]);
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedPaths.includes(path.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show More
                        </>
                      )}
                    </button>

                    {/* Expandable Details */}
                    {expandedPaths.includes(path.id) && (
                      <div className="space-y-4 pt-4 border-t">
                        {/* What You'll Do */}
                        <div>
                          <h3 className="font-semibold mb-2 text-sm">What you'll do:</h3>
                          <ul className="space-y-1">
                            {path.whatYouDo.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* What You Get */}
                        <div>
                          <h3 className="font-semibold mb-2 text-sm">What you get:</h3>
                          <ul className="space-y-2">
                            {path.whatYouGet.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                {item.type === 'success' ? (
                                  <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                )}
                                <span className={cn(
                                  item.type === 'warning' && "text-muted-foreground"
                                )}>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Why Choose */}
                        <div className="text-sm text-muted-foreground border-t pt-4">
                          <span className="font-medium">
                            {path.id === 'strategic-foundation' ? 'Why choose this: ' :
                             path.id === 'quick-start' ? 'Important: ' : 'Note: '}
                          </span>
                          {path.whyChoose}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Button - Always at bottom */}
                  <div className="pt-6 space-y-3">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handlePathSelect(path.id);
                      }}
                      disabled={isProcessing}
                      className={cn(
                        "w-full flex items-center justify-center gap-2",
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                        isProcessing && "opacity-50 cursor-not-allowed"
                      )}
                      variant="default"
                    >
                      {path.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Decision Help */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Still deciding?</h3>
                <p className="text-muted-foreground">
                  <strong>91% of users who complete Strategic Foundation</strong> say it's the best investment they've made in their business positioning. You can always upgrade from other paths later.
                </p>
              </div>

              {/* Quick Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2">Strategic Foundation</h4>
                  <p className="text-muted-foreground text-xs">Complete strategic clarity + 10x better results</p>
                </div>

                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2">Quick Start</h4>
                  <p className="text-muted-foreground text-xs">Get basic activations working at 80% effectiveness</p>
                </div>

                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-2">Build From Scratch</h4>
                  <p className="text-muted-foreground text-xs">Step-by-step foundation building with full control</p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">SC</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground mb-2 italic">
                      "I was torn between Quick Start and Strategic Foundation. So glad I chose Strategic Foundation – the AI suggestions are spot-on now, and our conversion rates improved 3x in just 2 weeks."
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Sarah Chen</strong> • SaaS Founder • $2M ARR
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Modal */}
          {videoModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">
                    {paths.find(p => p.id === videoModalOpen)?.title} - Video Explanation
                  </h3>
                  <button
                    onClick={() => setVideoModalOpen(null)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={videoModalOpen === 'overview' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : paths.find(p => p.id === videoModalOpen)?.videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Path explanation video"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}