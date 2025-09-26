'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PositioningOutput, StrategicQuestionResponse, BuyerPersona, MarketSegment } from '@/app/actions/businesses';
import {
  Target,
  Download,
  Share2,
  Users,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Award,
  BarChart3,
  Sparkles,
  Clock,
  User,
  Building2,
  Zap,
  Shield,
  Compass,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

interface PositioningOutputProps {
  businessData: any;
  selectedSegment: MarketSegment;
  selectedPersona: BuyerPersona;
  strategicResponses: Record<string, StrategicQuestionResponse>;
  onComplete?: () => void;
  onShare?: () => void;
  onPrevious?: () => void;
}

export function PositioningOutput({
  businessData,
  selectedSegment,
  selectedPersona,
  strategicResponses,
  onComplete,
  onShare,
  onPrevious
}: PositioningOutputProps) {
  const [positioningData, setPositioningData] = useState<PositioningOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Generate positioning output based on responses
  useEffect(() => {
    const generatePositioning = async () => {
      setIsGenerating(true);

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extract key responses
      const responses = strategicResponses;
      const problem = responses['1']?.answer || 'Undefined positioning challenge';
      const category = responses['2']?.answer || 'Strategic consulting';
      const transformation = responses['4']?.answer || 'Clear market differentiation';
      const identity = responses['7']?.answer || 'Strategic positioning experts';
      const contrarian = responses['9']?.answer || 'Fast strategic clarity over lengthy analysis';
      const onlyPosition = responses['12']?.answer || 'Only platform delivering real-time positioning';
      const uniqueValue = responses['14']?.answer || 'Strategic clarity in days not months';
      const success = responses['15']?.answer || '100 customers in 12 months';

      // Calculate strength scores based on answer quality and confidence
      const calculateScore = (questionId: string): number => {
        const response = responses[questionId];
        if (!response) return 0;

        const answerLength = response.answer.length;
        const confidenceMultiplier = response.confidence === 'high' ? 1 : response.confidence === 'medium' ? 0.85 : 0.7;

        let baseScore = Math.min(100, (answerLength / 10) * 5); // Rough scoring based on answer length
        return Math.round(baseScore * confidenceMultiplier);
      };

      const problemClarity = calculateScore('1');
      const segmentFocus = 100; // Always 100% since they selected a specific segment
      const uniquePosition = Math.max(calculateScore('12'), calculateScore('7'));
      const valueClarity = calculateScore('14');
      const overall = Math.round((problemClarity + segmentFocus + uniquePosition + valueClarity) / 4);

      // Generate positioning statement
      const positioningStatement = `For ${selectedPersona.name.toLowerCase()} at ${selectedSegment.name.toLowerCase()} companies struggling with ${problem.toLowerCase()}, we're ${identity.toLowerCase()} who deliver ${uniqueValue.toLowerCase()}, because we believe ${contrarian.toLowerCase()}.`;

      const positioning: PositioningOutput = {
        positioning_statement: positioningStatement,
        segment: selectedSegment.name,
        persona: selectedPersona.name,
        problem: problem,
        category: category,
        obstacle: responses['3']?.answer || 'Multiple barriers',
        transformation: transformation,
        identity: identity,
        values: responses['8']?.answer?.split(',').map(v => v.trim()) || ['Quality', 'Speed', 'Results'],
        belief: contrarian,
        sacrifice: responses['10']?.answer || 'Serving everyone equally',
        alternatives: responses['11']?.answer || 'DIY or expensive consultants',
        only_position: onlyPosition,
        decision_driver: responses['13']?.answer || 'Combination of factors',
        unique_value: uniqueValue,
        success_metrics: success,
        strength_scores: {
          problem_clarity: problemClarity,
          segment_focus: segmentFocus,
          unique_position: uniquePosition,
          value_clarity: valueClarity,
          overall: overall
        },
        generated_at: new Date().toISOString()
      };

      setPositioningData(positioning);
      setIsGenerating(false);
    };

    generatePositioning();
  }, [strategicResponses, selectedSegment, selectedPersona]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Strong';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  const handleDownload = () => {
    if (!positioningData) return;

    const content = `
# Strategic Positioning Report
Generated: ${new Date().toLocaleDateString()}

## Positioning Statement
${positioningData.positioning_statement}

## Core Elements
- **Target Segment:** ${positioningData.segment}
- **Buyer Persona:** ${positioningData.persona}
- **Problem:** ${positioningData.problem}
- **Category:** ${positioningData.category}
- **Transformation:** ${positioningData.transformation}

## Strategic Positioning
- **Identity:** ${positioningData.identity}
- **Contrarian Belief:** ${positioningData.belief}
- **Only Position:** ${positioningData.only_position}
- **Unique Value:** ${positioningData.unique_value}

## Strength Analysis
- Problem Clarity: ${positioningData.strength_scores.problem_clarity}%
- Segment Focus: ${positioningData.strength_scores.segment_focus}%
- Unique Position: ${positioningData.strength_scores.unique_position}%
- Value Clarity: ${positioningData.strength_scores.value_clarity}%
- **Overall Score: ${positioningData.strength_scores.overall}%**

## Success Metrics
${positioningData.success_metrics}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessData.name || 'Business'}-positioning-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Positioning report downloaded!');
  };

  if (isGenerating) {
    return (
      <div className="space-y-8">
        <div className="text-center py-16">
          <div className="relative">
            <Sparkles className="h-16 w-16 animate-pulse mx-auto mb-6 text-primary" />
            <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold mb-3">Generating Your Strategic Positioning</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our AI is analyzing your responses to create a comprehensive positioning strategy that differentiates you in the market...
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>✓ Analyzing market segment dynamics</p>
            <p>✓ Processing buyer persona insights</p>
            <p>✓ Calculating positioning strength</p>
            <p>✓ Crafting your unique positioning statement</p>
          </div>
        </div>
      </div>
    );
  }

  if (!positioningData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Unable to generate positioning. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Your Strategic Positioning</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your responses, we've created a comprehensive positioning strategy that differentiates your business and attracts your ideal customers.
        </p>
      </div>

      {/* Positioning Statement */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Positioning Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="text-lg font-medium italic leading-relaxed border-l-4 border-primary pl-4">
            "{positioningData.positioning_statement}"
          </blockquote>
        </CardContent>
      </Card>

      {/* Key Elements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Target Market
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium text-sm text-muted-foreground">SEGMENT</p>
              <p className="text-sm">{positioningData.segment}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-muted-foreground">PERSONA</p>
              <p className="text-sm">{positioningData.persona}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Core Problem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{positioningData.problem}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Transformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{positioningData.transformation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Your Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{positioningData.identity}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {positioningData.values.slice(0, 3).map((value, idx) => (
                <li key={idx}>• {value}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4" />
              Contrarian Belief
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{positioningData.belief}</p>
          </CardContent>
        </Card>
      </div>

      {/* Unique Positioning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Only Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{positioningData.only_position}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Unique Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{positioningData.unique_value}</p>
          </CardContent>
        </Card>
      </div>

      {/* Positioning Strength Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Positioning Strength Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Problem Clarity', score: positioningData.strength_scores.problem_clarity },
              { label: 'Segment Focus', score: positioningData.strength_scores.segment_focus },
              { label: 'Unique Position', score: positioningData.strength_scores.unique_position },
              { label: 'Value Clarity', score: positioningData.strength_scores.value_clarity }
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted-foreground/20"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${item.score}, 100`}
                      className={getScoreColor(item.score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-lg font-bold", getScoreColor(item.score))}>
                      {item.score}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className={cn("text-xs", getScoreColor(item.score))}>
                    {getScoreText(item.score)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Overall Positioning Strength</p>
              <div className={cn("text-3xl font-bold", getScoreColor(positioningData.strength_scores.overall))}>
                {positioningData.strength_scores.overall}% Ready
              </div>
              <p className="text-sm text-muted-foreground">
                {positioningData.strength_scores.overall >= 80 ?
                  "Your positioning is strong and ready for market!" :
                  "Consider refining some responses to strengthen your positioning."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{positioningData.success_metrics}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Full Report
          </Button>

          <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share with Team
          </Button>

          <Button variant="outline" onClick={onComplete} className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Continue to Dashboard
          </Button>
        </div>

        {/* Navigation - Previous Button */}
        {onPrevious && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous: Strategic Questions
            </Button>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>
          Generated in {Math.floor((Date.now() - new Date(positioningData.generated_at).getTime()) / 1000)} seconds using AI analysis
        </p>
      </div>
    </div>
  );
}