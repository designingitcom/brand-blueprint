'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MarketSegment } from '@/app/actions/businesses';
import {
  Target,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

interface SegmentSelectionProps {
  businessData: any;
  onSegmentSelected: (
    primary: MarketSegment,
    secondary?: MarketSegment
  ) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
  quickStart?: boolean;
}

export function SegmentSelection({
  businessData,
  onSegmentSelected,
  onPrevious,
  onNext,
  isLoading = false,
  quickStart = false,
}: SegmentSelectionProps) {
  const [segments, setSegments] = useState<MarketSegment[]>([]);
  const [primarySegment, setPrimarySegment] = useState<string>('');
  const [secondarySegment, setSecondarySegment] = useState<string>('');
  const [customSegment, setCustomSegment] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  // Simulated AI suggestions based on business data
  useEffect(() => {
    const generateAISuggestions = async () => {
      setLoadingSegments(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate segments based on business industry and type
      const allSegments: MarketSegment[] = [
        {
          id: '1',
          name: 'Growing B2B SaaS',
          description: '11-50 employees, Series A funded',
          pain: "Can't differentiate from competitors",
          opportunity: 'High growth, need speed',
          ai_suggested: true,
        },
        {
          id: '2',
          name: 'Traditional Businesses Going Digital',
          description: '50-200 employees, established',
          pain: 'No digital expertise',
          opportunity: 'Big budgets, long contracts',
          ai_suggested: true,
        },
        {
          id: '3',
          name: 'Bootstrapped Startups',
          description: '1-10 employees, founder-led',
          pain: 'Limited resources',
          opportunity: 'Fast decisions, loyal',
          ai_suggested: true,
        },
        {
          id: '4',
          name: 'E-commerce Retailers',
          description: 'Direct-to-consumer, inventory-based',
          pain: 'High customer acquisition costs',
          opportunity: 'Large addressable market',
          ai_suggested: true,
        },
        {
          id: '5',
          name: 'Professional Services Firms',
          description: 'Consulting and service-based',
          pain: 'Commoditized services',
          opportunity: 'High-value relationships',
          ai_suggested: true,
        },
        {
          id: '6',
          name: 'Healthcare & Medical',
          description: 'Medical practices, healthcare tech',
          pain: 'Regulatory compliance challenges',
          opportunity: 'Growing market demand',
          ai_suggested: true,
        },
      ];

      // For Quick Start mode, only show 3 AI options
      const suggestedSegments = quickStart
        ? allSegments.slice(0, 3)
        : allSegments;

      setSegments(suggestedSegments);
      setLoadingSegments(false);
    };

    generateAISuggestions();
  }, []); // Only run once on component mount

  const handleSegmentSelection = (
    segmentId: string,
    type: 'primary' | 'secondary'
  ) => {
    let newPrimaryId = primarySegment;
    let newSecondaryId = secondarySegment;

    if (type === 'primary') {
      newPrimaryId = segmentId;
      setPrimarySegment(segmentId);
      // If selecting same as secondary, clear secondary
      if (segmentId === secondarySegment) {
        newSecondaryId = '';
        setSecondarySegment('');
      }
    } else {
      newSecondaryId = segmentId === 'none' ? '' : segmentId;
      setSecondarySegment(newSecondaryId);
    }

    // Update parent with new selections using the updated values
    const primary = segments.find(s => s.id === newPrimaryId);
    const secondary = newSecondaryId
      ? segments.find(s => s.id === newSecondaryId)
      : undefined;

    if (primary) {
      onSegmentSelected(primary, secondary);
    }
  };

  // Navigation handled by parent wizard

  const handleChatWithAI = () => {
    setChatOpen(true);
    toast.info('AI chat feature coming soon!', {
      description:
        "You'll be able to discuss segment options with our AI assistant.",
    });
  };

  if (loadingSegments) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium mb-2">AI Analyzing Your Business</p>
          <p className="text-muted-foreground">
            Generating personalized market segments based on your industry,
            services, and competitors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Choose Your Market Segments
        </h2>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>
              Based on your {businessData?.industry} business serving{' '}
              {businessData?.services?.[0]?.name || 'your services'},
            </strong>
            <br />
            Select 1-2 market segments. The first selected will be your primary
            segment.
          </p>
        </div>
      </div>

      {/* Segment Selection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">
            Select segments (1-2 maximum)
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleChatWithAI}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Chat with AI: "Help me choose"
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {segments.map(segment => {
            const isPrimary = primarySegment === segment.id;
            const isSecondary = secondarySegment === segment.id;

            return (
              <div
                key={segment.id}
                className={cn(
                  'relative border rounded-lg p-4 hover:shadow-md transition-all duration-200',
                  isPrimary
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : isSecondary
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : 'border-border bg-card hover:border-gray-300'
                )}
              >
                {/* Dropdown in top right */}
                <div className="absolute top-3 right-3">
                  <Select
                    value={
                      isPrimary ? 'primary' : isSecondary ? 'secondary' : 'none'
                    }
                    onValueChange={value => {
                      if (value === 'primary') {
                        handleSegmentSelection(segment.id, 'primary');
                      } else if (value === 'secondary') {
                        handleSegmentSelection(segment.id, 'secondary');
                      } else {
                        // Remove selection
                        if (isPrimary) {
                          setPrimarySegment('');
                        }
                        if (isSecondary) {
                          setSecondarySegment('');
                        }
                        // Update parent with cleared selection
                        const remainingPrimary = isPrimary
                          ? undefined
                          : segments.find(s => s.id === primarySegment);
                        const remainingSecondary = isSecondary
                          ? undefined
                          : segments.find(s => s.id === secondarySegment);
                        if (remainingPrimary) {
                          onSegmentSelected(
                            remainingPrimary,
                            remainingSecondary
                          );
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem
                        value="primary"
                        disabled={primarySegment !== '' && !isPrimary}
                      >
                        Primary
                      </SelectItem>
                      <SelectItem
                        value="secondary"
                        disabled={secondarySegment !== '' && !isSecondary}
                      >
                        Secondary
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Badge */}
                {segment.ai_suggested && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Suggested
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="pr-36">
                  <h3 className="font-semibold text-lg mb-2">{segment.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {segment.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700 dark:text-red-400">
                          Pain Point
                        </p>
                        <p className="text-sm">{segment.pain}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700 dark:text-green-400">
                          Opportunity
                        </p>
                        <p className="text-sm">{segment.opportunity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Badge */}
                {isPrimary && (
                  <div className="absolute bottom-3 left-3">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium">
                      Primary Target
                    </div>
                  </div>
                )}
                {isSecondary && (
                  <div className="absolute bottom-3 left-3">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-purple-500 text-white text-xs font-medium">
                      Secondary Target
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Segment Option */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-dashed border-border bg-muted/30">
            <input
              type="checkbox"
              id="custom-segment"
              checked={showCustom}
              onChange={e => setShowCustom(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="custom-segment" className="cursor-pointer">
              None of these fit? Describe your own segment
            </Label>
          </div>

          {showCustom && (
            <Textarea
              value={customSegment}
              onChange={e => setCustomSegment(e.target.value)}
              placeholder="Describe your target market segment (industry, size, characteristics, pain points, etc.)"
              className="min-h-[100px]"
            />
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {primarySegment && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-2">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Selected Segments:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Primary:</strong>{' '}
              {segments.find(s => s.id === primarySegment)?.name}
              {secondarySegment && (
                <>
                  <br />
                  <strong>Secondary:</strong>{' '}
                  {segments.find(s => s.id === secondarySegment)?.name}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Navigation removed - handled by parent wizard */}
    </div>
  );
}
