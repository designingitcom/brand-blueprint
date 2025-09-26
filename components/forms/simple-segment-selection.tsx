'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MarketSegment } from '@/app/actions/businesses';

interface SimpleSegmentSelectionProps {
  onSegmentSelected: (
    primary: MarketSegment,
    secondary?: MarketSegment
  ) => void;
}

export function SimpleSegmentSelection({
  onSegmentSelected,
}: SimpleSegmentSelectionProps) {
  const [primarySegment, setPrimarySegment] = useState<string>('');
  const [secondarySegment, setSecondarySegment] = useState<string>('');

  // Available segments
  const availableSegments: MarketSegment[] = [
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
  ];

  const handlePrimaryChange = (value: string) => {
    setPrimarySegment(value);

    const primary = availableSegments.find(s => s.id === value);
    const secondary = secondarySegment
      ? availableSegments.find(s => s.id === secondarySegment)
      : undefined;

    if (primary) {
      onSegmentSelected(primary, secondary);
    }
  };

  const handleSecondaryChange = (value: string) => {
    setSecondarySegment(value);

    const primary = primarySegment
      ? availableSegments.find(s => s.id === primarySegment)
      : null;
    const secondary =
      value && value !== 'none'
        ? availableSegments.find(s => s.id === value)
        : undefined;

    if (primary) {
      onSegmentSelected(primary, secondary);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Who is your target audience?</h2>
        <p className="text-muted-foreground">
          Select your primary and optionally secondary market segments
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Segment *</Label>
          <Select value={primarySegment} onValueChange={handlePrimaryChange}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select primary segment..." />
            </SelectTrigger>
            <SelectContent>
              {availableSegments.map(segment => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Secondary Segment (Optional)</Label>
          <Select
            value={secondarySegment}
            onValueChange={handleSecondaryChange}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select secondary segment..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {availableSegments
                .filter(segment => segment.id !== primarySegment)
                .map(segment => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {primarySegment && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-2">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Selected Segments:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Primary:</strong>{' '}
              {availableSegments.find(s => s.id === primarySegment)?.name}
              {secondarySegment && secondarySegment !== 'none' && (
                <>
                  <br />
                  <strong>Secondary:</strong>{' '}
                  {availableSegments.find(s => s.id === secondarySegment)?.name}
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
