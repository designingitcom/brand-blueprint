'use client';

import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UnlockMessageProps {
  feature: string;
  description: string;
  onUnlock?: () => void;
  actionLabel?: string;
}

export function UnlockMessage({
  feature,
  description,
  onUnlock,
  actionLabel = 'Complete Foundation',
}: UnlockMessageProps) {
  return (
    <Card className="max-w-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-muted p-3">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">{feature} Locked</h2>

      <p className="text-muted-foreground mb-6">{description}</p>

      {onUnlock && (
        <Button onClick={onUnlock} className="w-full">
          {actionLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </Card>
  );
}
