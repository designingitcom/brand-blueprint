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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BuyerPersona, MarketSegment } from '@/app/actions/businesses';
import {
  User,
  Users,
  BookOpen,
  Zap,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  Target,
} from 'lucide-react';

interface PersonaSelectionProps {
  primarySegment: MarketSegment;
  secondarySegment?: MarketSegment;
  onPersonaSelected: (primary: BuyerPersona, secondary?: BuyerPersona) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
  quickStart?: boolean;
}

export function PersonaSelection({
  primarySegment,
  secondarySegment,
  onPersonaSelected,
  onPrevious,
  onNext,
  isLoading = false,
  quickStart = false,
}: PersonaSelectionProps) {
  const [primaryPersonas, setPrimaryPersonas] = useState<BuyerPersona[]>([]);
  const [secondaryPersonas, setSecondaryPersonas] = useState<BuyerPersona[]>(
    []
  );
  const [primaryPersona, setPrimaryPersona] = useState<string>('');
  const [secondaryPersona, setSecondaryPersona] = useState<string>('');
  const [loadingPersonas, setLoadingPersonas] = useState(true);

  // Generate personas for both primary and secondary segments
  useEffect(() => {
    const generatePersonasForSegments = async () => {
      setLoadingPersonas(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate personas for primary segment
      const primaryPersonaTypes: BuyerPersona[] = [
        {
          id: `primary-ceo`,
          name: `CEO/Founder`,
          description: `Visionary leader driving ${primarySegment.name} growth`,
          characteristics: [
            'Strategic thinking',
            'Budget authority',
            'Long-term vision',
            'Risk tolerance',
          ],
          reads: [
            'Harvard Business Review',
            'Industry reports',
            'Leadership podcasts',
          ],
          trigger: 'Business transformation opportunity',
          ai_suggested: true,
        },
        {
          id: `primary-cto`,
          name: `CTO/Tech Lead`,
          description: `Technology decision maker in ${primarySegment.name}`,
          characteristics: [
            'Technical expertise',
            'Implementation focus',
            'Security conscious',
            'Innovation driven',
          ],
          reads: [
            'Tech blogs',
            'GitHub',
            'Stack Overflow',
            'Developer communities',
          ],
          trigger: 'Technical challenges or upgrades',
          ai_suggested: true,
        },
        {
          id: `primary-cmo`,
          name: `CMO/Marketing Lead`,
          description: `Marketing leader in ${primarySegment.name}`,
          characteristics: [
            'Brand conscious',
            'ROI focused',
            'Customer-centric',
            'Growth hacker',
          ],
          reads: [
            'Marketing publications',
            'Case studies',
            'Analytics dashboards',
          ],
          trigger: 'Market positioning needs',
          ai_suggested: true,
        },
        {
          id: `primary-coo`,
          name: `COO/Operations Lead`,
          description: `Operations leader optimizing ${primarySegment.name} processes`,
          characteristics: [
            'Process optimization',
            'Efficiency focused',
            'Scale operations',
            'Quality control',
          ],
          reads: [
            'Operations journals',
            'Process improvement guides',
            'Lean methodologies',
          ],
          trigger: 'Operational efficiency needs',
          ai_suggested: true,
        },
        {
          id: `primary-sales`,
          name: `Sales Director`,
          description: `Revenue leader driving ${primarySegment.name} sales growth`,
          characteristics: [
            'Revenue focused',
            'Relationship builder',
            'Goal oriented',
            'Customer champion',
          ],
          reads: ['Sales methodologies', 'CRM reports', 'Industry benchmarks'],
          trigger: 'Revenue growth opportunities',
          ai_suggested: true,
        },
      ];

      // For Quick Start mode, only show 2 AI options
      const limitedPrimaryPersonas = quickStart
        ? primaryPersonaTypes.slice(0, 2)
        : primaryPersonaTypes;
      setPrimaryPersonas(limitedPrimaryPersonas);

      // Generate personas for secondary segment if it exists
      if (secondarySegment) {
        const secondaryPersonaTypes: BuyerPersona[] = [
          {
            id: `secondary-ceo`,
            name: `CEO/Founder`,
            description: `Visionary leader driving ${secondarySegment.name} growth`,
            characteristics: [
              'Strategic thinking',
              'Budget authority',
              'Long-term vision',
              'Risk tolerance',
            ],
            reads: [
              'Harvard Business Review',
              'Industry reports',
              'Leadership podcasts',
            ],
            trigger: 'Business transformation opportunity',
            ai_suggested: true,
          },
          {
            id: `secondary-cto`,
            name: `CTO/Tech Lead`,
            description: `Technology decision maker in ${secondarySegment.name}`,
            characteristics: [
              'Technical expertise',
              'Implementation focus',
              'Security conscious',
              'Innovation driven',
            ],
            reads: [
              'Tech blogs',
              'GitHub',
              'Stack Overflow',
              'Developer communities',
            ],
            trigger: 'Technical challenges or upgrades',
            ai_suggested: true,
          },
          {
            id: `secondary-cmo`,
            name: `CMO/Marketing Lead`,
            description: `Marketing leader in ${secondarySegment.name}`,
            characteristics: [
              'Brand conscious',
              'ROI focused',
              'Customer-centric',
              'Growth hacker',
            ],
            reads: [
              'Marketing publications',
              'Case studies',
              'Analytics dashboards',
            ],
            trigger: 'Market positioning needs',
            ai_suggested: true,
          },
          {
            id: `secondary-coo`,
            name: `COO/Operations Lead`,
            description: `Operations leader optimizing ${secondarySegment.name} processes`,
            characteristics: [
              'Process optimization',
              'Efficiency focused',
              'Scale operations',
              'Quality control',
            ],
            reads: [
              'Operations journals',
              'Process improvement guides',
              'Lean methodologies',
            ],
            trigger: 'Operational efficiency needs',
            ai_suggested: true,
          },
          {
            id: `secondary-sales`,
            name: `Sales Director`,
            description: `Revenue leader driving ${secondarySegment.name} sales growth`,
            characteristics: [
              'Revenue focused',
              'Relationship builder',
              'Goal oriented',
              'Customer champion',
            ],
            reads: [
              'Sales methodologies',
              'CRM reports',
              'Industry benchmarks',
            ],
            trigger: 'Revenue growth opportunities',
            ai_suggested: true,
          },
        ];
        // For Quick Start mode, only show 2 AI options for secondary personas too
        const limitedSecondaryPersonas = quickStart
          ? secondaryPersonaTypes.slice(0, 2)
          : secondaryPersonaTypes;
        setSecondaryPersonas(limitedSecondaryPersonas);
      } else {
        setSecondaryPersonas([]);
      }

      setLoadingPersonas(false);
    };

    generatePersonasForSegments();
  }, [primarySegment, secondarySegment, quickStart]);

  const handlePersonaSelection = (
    personaId: string,
    type: 'primary' | 'secondary'
  ) => {
    if (type === 'primary') {
      setPrimaryPersona(personaId);
      // If selecting same as secondary, clear secondary
      if (personaId === secondaryPersona) {
        setSecondaryPersona('');
      }
    } else {
      setSecondaryPersona(personaId === 'none' ? '' : personaId);
    }

    // Update parent with new selections
    const allPersonas = [...primaryPersonas, ...secondaryPersonas];
    const primary = allPersonas.find(
      p => p.id === (type === 'primary' ? personaId : primaryPersona)
    );
    const secondary =
      type === 'secondary'
        ? personaId === 'none'
          ? undefined
          : allPersonas.find(p => p.id === personaId)
        : secondaryPersona
          ? allPersonas.find(p => p.id === secondaryPersona)
          : undefined;

    if (primary) {
      onPersonaSelected(primary, secondary);
    }
  };

  // Navigation handled by parent wizard

  if (loadingPersonas) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium mb-2">
            AI Generating Customer Personas
          </p>
          <p className="text-muted-foreground">
            Creating buyer personas for your selected segments...
          </p>
        </div>
      </div>
    );
  }

  const allPersonas = [...primaryPersonas, ...secondaryPersonas];

  return (
    <div className="space-y-6">
      {/* AI Suggestions Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              AI-Generated Customer Personas
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Based on your selected market segments, these personas represent
              your ideal customer profiles. Choose your primary ICP (Ideal
              Customer Profile) and optionally a secondary persona.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          Define your customer personas
        </h2>
        <p className="text-muted-foreground">
          Select your primary and secondary Ideal Customer Profiles based on
          your chosen segments
        </p>
      </div>

      {/* Primary Segment Personas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">
            Primary Segment: {primarySegment.name}
          </h3>
          <Badge variant="default">Primary</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {primaryPersonas.map(persona => {
            const isPrimary = primaryPersona === persona.id;
            const isSecondary = secondaryPersona === persona.id;

            return (
              <div
                key={persona.id}
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
                        handlePersonaSelection(persona.id, 'primary');
                      } else if (value === 'secondary') {
                        handlePersonaSelection(persona.id, 'secondary');
                      } else {
                        // Remove selection
                        if (isPrimary) {
                          setPrimaryPersona('');
                        }
                        if (isSecondary) {
                          setSecondaryPersona('');
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue placeholder="ICP..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem
                        value="primary"
                        disabled={primaryPersona !== '' && !isPrimary}
                      >
                        {primarySegment.name}
                      </SelectItem>
                      {secondarySegment && (
                        <SelectItem
                          value="secondary"
                          disabled={secondaryPersona !== '' && !isSecondary}
                        >
                          {secondarySegment.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Badge */}
                {persona.ai_suggested && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="pr-28">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-lg">{persona.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {persona.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                          Key Traits
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.characteristics
                            .slice(0, 3)
                            .map((trait, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                              >
                                {trait}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700 dark:text-green-400">
                          Reads
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {persona.reads.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                          Decision Trigger
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {persona.trigger}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Badge */}
                {isPrimary && (
                  <div className="absolute bottom-3 left-3">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium">
                      Primary ICP
                    </div>
                  </div>
                )}
                {isSecondary && (
                  <div className="absolute bottom-3 left-3">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-purple-500 text-white text-xs font-medium">
                      Secondary ICP
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Segment Personas */}
      {secondarySegment && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">
              Secondary Segment: {secondarySegment.name}
            </h3>
            <Badge variant="secondary">Secondary</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {secondaryPersonas.map(persona => {
              const isPrimary = primaryPersona === persona.id;
              const isSecondary = secondaryPersona === persona.id;

              return (
                <div
                  key={persona.id}
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
                        isPrimary
                          ? 'primary'
                          : isSecondary
                            ? 'secondary'
                            : 'none'
                      }
                      onValueChange={value => {
                        if (value === 'primary') {
                          handlePersonaSelection(persona.id, 'primary');
                        } else if (value === 'secondary') {
                          handlePersonaSelection(persona.id, 'secondary');
                        } else {
                          // Remove selection
                          if (isPrimary) {
                            setPrimaryPersona('');
                          }
                          if (isSecondary) {
                            setSecondaryPersona('');
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue placeholder="ICP..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem
                          value="primary"
                          disabled={primaryPersona !== '' && !isPrimary}
                        >
                          {primarySegment.name}
                        </SelectItem>
                        {secondarySegment && (
                          <SelectItem
                            value="secondary"
                            disabled={secondaryPersona !== '' && !isSecondary}
                          >
                            {secondarySegment.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI Badge */}
                  {persona.ai_suggested && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="pr-28">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-lg">{persona.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {persona.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                            Key Traits
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {persona.characteristics
                              .slice(0, 3)
                              .map((trait, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                                >
                                  {trait}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-green-700 dark:text-green-400">
                            Reads
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {persona.reads.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                            Decision Trigger
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {persona.trigger}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Badge */}
                  {isPrimary && (
                    <div className="absolute bottom-3 left-3">
                      <div className="inline-flex items-center px-2 py-1 rounded bg-blue-500 text-white text-xs font-medium">
                        Primary ICP
                      </div>
                    </div>
                  )}
                  {isSecondary && (
                    <div className="absolute bottom-3 left-3">
                      <div className="inline-flex items-center px-2 py-1 rounded bg-purple-500 text-white text-xs font-medium">
                        Secondary ICP
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {primaryPersona && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-2">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Selected ICPs:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{primarySegment.name}:</strong>{' '}
              {allPersonas.find(p => p.id === primaryPersona)?.name}
              {secondaryPersona && secondarySegment && (
                <>
                  <br />
                  <strong>{secondarySegment.name}:</strong>{' '}
                  {allPersonas.find(p => p.id === secondaryPersona)?.name}
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
