'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Lightbulb,
  Award,
  TrendingUp,
  MessageSquare,
  Download,
  Share2,
  Edit,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface StrategicResultsProps {
  formData: any;
  onEdit: () => void;
  onContinue: () => void;
}

interface AccordionSection {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export function StrategicResults({
  formData,
  onEdit,
  onContinue,
}: StrategicResultsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    positioning: true,
    audience: false,
    messaging: false,
    competitive: false,
    activation: false,
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections: AccordionSection[] = [
    {
      id: 'positioning',
      title: 'Strategic Positioning Statement',
      icon: Target,
      defaultOpen: true,
      content: (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h4 className="font-semibold mb-3 text-primary">
              Your Core Positioning
            </h4>
            <p className="text-lg leading-relaxed">
              "{formData.businessName} helps{' '}
              {formData.targetAudience || 'target customers'} in the{' '}
              {formData.industry} industry overcome{' '}
              {formData.mainObstacle || 'key challenges'} by delivering{' '}
              {formData.uniqueValue || 'unique solutions'}
              through our {formData.secretSauce || 'proven methodology'}."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Category Definition</h4>
              <p className="text-muted-foreground">
                {formData.currentCategory || 'Strategic Consulting'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Market Position</h4>
              <p className="text-muted-foreground">
                {formData.marketPosition || 'Market Leader'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Core Problem We Solve</h4>
              <p className="text-muted-foreground">
                {formData.targetProblem ||
                  'Strategic clarity and execution challenges'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Transformation We Enable</h4>
              <p className="text-muted-foreground">
                {formData.desiredTransformation ||
                  'Strategic clarity to market leadership'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'audience',
      title: 'Target Audience & Personas',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Primary Target Audience</h4>
            <p className="text-muted-foreground mb-4">
              {formData.targetAudience ||
                'Strategic business leaders seeking clarity'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Customer Personas</h4>
            <div className="space-y-4">
              {formData.customerPersonas ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">
                    {formData.customerPersonas}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Strategic Leaders</h5>
                    <p className="text-sm text-muted-foreground">
                      C-level executives and strategic decision makers who need
                      clarity on positioning and go-to-market strategy.
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Growth-Stage Companies</h5>
                    <p className="text-sm text-muted-foreground">
                      Companies ready to scale but lacking strategic foundation
                      and clear market positioning.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Decision Triggers</h4>
            <p className="text-muted-foreground">
              {formData.decisionTrigger ||
                'Need for strategic clarity to drive growth'}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'messaging',
      title: 'Core Messaging & Value Props',
      icon: MessageSquare,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Core Value Proposition</h4>
            <p className="text-muted-foreground text-lg">
              {formData.valueProposition ||
                'Strategic clarity that drives measurable business growth'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Why Now?</h4>
              <p className="text-muted-foreground">
                {formData.whyNow ||
                  'Market conditions require strategic differentiation'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Why Us?</h4>
              <p className="text-muted-foreground">
                {formData.whyYou ||
                  'Proven methodology with measurable results'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Brand Values</h4>
            <p className="text-muted-foreground">
              {formData.brandValues ||
                'Clarity, Results, Partnership, Innovation'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Controversial Belief</h4>
            <p className="text-muted-foreground">
              {formData.controversialBelief ||
                'Most strategy consulting is generic advice wrapped in fancy frameworks'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">What We Don't Do</h4>
            <p className="text-muted-foreground">
              {formData.notDoing ||
                'Generic consulting, one-size-fits-all solutions, or long engagements without clear outcomes'}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'competitive',
      title: 'Competitive Intelligence',
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Competitive Advantage</h4>
            <p className="text-muted-foreground text-lg">
              {formData.competitiveAdvantage ||
                'Unique combination of strategic expertise and practical implementation'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Our Secret Sauce</h4>
            <p className="text-muted-foreground">
              {formData.secretSauce ||
                'Proprietary methodology that delivers results in 90 days or less'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Unique Approach</h4>
            <p className="text-muted-foreground">
              {formData.uniqueApproach ||
                'Strategy + Implementation + Accountability in one integrated solution'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Customer Alternatives</h4>
            <p className="text-muted-foreground">
              {formData.customerAlternatives ||
                'Expensive consultants, generic frameworks, or trying to figure it out internally'}
            </p>
          </div>

          {formData.competitors && formData.competitors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Key Competitors</h4>
              <div className="space-y-3">
                {formData.competitors.map((competitor: any, index: number) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-1">{competitor.url}</h5>
                    <p className="text-sm text-muted-foreground">
                      {competitor.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'activation',
      title: 'Success Metrics & Next Steps',
      icon: Award,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Success Metrics</h4>
            <p className="text-muted-foreground">
              {formData.successMetrics ||
                'Revenue growth, market share, customer acquisition, strategic clarity scores'}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200">
              Ready for Activation
            </h4>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your strategic foundation is complete! Now you can access all
              platform features with full AI personalization.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>All marketing activations unlocked</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>AI assistance fully personalized</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Strategic positioning document ready</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Recommended Next Steps</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h5 className="font-medium">Review & Refine</h5>
                  <p className="text-sm text-muted-foreground">
                    Take a few minutes to review your positioning and make any
                    adjustments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h5 className="font-medium">Activate Marketing</h5>
                  <p className="text-sm text-muted-foreground">
                    Start creating personalized marketing content and campaigns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h5 className="font-medium">Share & Align</h5>
                  <p className="text-sm text-muted-foreground">
                    Share your positioning with your team and align on messaging
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const scrollToSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: true }));
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="h-4 w-4" />
              Strategic Foundation Complete
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Strategic Positioning
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Based on your responses, here's your comprehensive strategic
              positioning document. All platform features are now unlocked with
              full AI personalization.
            </p>

            {/* Jump Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {sections.map(section => {
              const Icon = section.icon;
              const isOpen = openSections[section.id];

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-card border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 border-t">
                      <div className="pt-6">{section.content}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t">
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Responses
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Results
            </Button>
            <Button onClick={onContinue} className="flex items-center gap-2">
              Continue to Platform
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
