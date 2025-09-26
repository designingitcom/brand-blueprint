'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MarketSegment, BuyerPersona } from '@/app/actions/businesses';

interface SimplePersonaSelectionProps {
  primarySegment: MarketSegment;
  secondarySegment?: MarketSegment;
  onPersonaSelected: (persona: BuyerPersona) => void;
}

export function SimplePersonaSelection({
  primarySegment,
  secondarySegment,
  onPersonaSelected
}: SimplePersonaSelectionProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>('');

  // Create personas based on selected segments
  const availablePersonas: BuyerPersona[] = [
    // Primary segment persona
    {
      id: `primary-${primarySegment.id}`,
      name: `${primarySegment.name} Decision Maker`,
      description: `Key decision maker in ${primarySegment.name}`,
      characteristics: [
        'Budget authority',
        'Problem aware',
        'Solution seeking',
        'Results focused'
      ],
      reads: ['Industry publications', 'Professional networks'],
      trigger: 'Business challenge or opportunity',
      ai_suggested: true
    },
    // Secondary segment persona (if exists)
    ...(secondarySegment ? [{
      id: `secondary-${secondarySegment.id}`,
      name: `${secondarySegment.name} Decision Maker`,
      description: `Key decision maker in ${secondarySegment.name}`,
      characteristics: [
        'Budget authority',
        'Problem aware',
        'Solution seeking',
        'Results focused'
      ],
      reads: ['Industry publications', 'Professional networks'],
      trigger: 'Business challenge or opportunity',
      ai_suggested: true
    }] : [])
  ];

  const handlePersonaChange = (value: string) => {
    setSelectedPersona(value);
    const persona = availablePersonas.find(p => p.id === value);
    if (persona) {
      onPersonaSelected(persona);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Define your customer personas</h2>
        <p className="text-muted-foreground">Choose which of your selected segments to focus on</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Target Persona *</Label>
          <Select value={selectedPersona} onValueChange={handlePersonaChange}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose persona based on your segments..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={`primary-${primarySegment.id}`}>
                {primarySegment.name} (Primary Segment)
              </SelectItem>
              {secondarySegment && (
                <SelectItem value={`secondary-${secondarySegment.id}`}>
                  {secondarySegment.name} (Secondary Segment)
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedPersona && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="space-y-2">
            <p className="font-medium text-green-800 dark:text-green-200">Selected Persona:</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>{availablePersonas.find(p => p.id === selectedPersona)?.name}</strong>
              <br />
              {availablePersonas.find(p => p.id === selectedPersona)?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}