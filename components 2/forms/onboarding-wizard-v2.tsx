'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { OnboardingWizardV2Content } from './onboarding-wizard-v2-content';

interface OnboardingWizardV2Props {
  userId?: string;
  businessId?: string;
  existingBusiness?: any;
  onComplete?: (result: any) => void;
  onClose?: () => void;
  triggerButton?: React.ReactNode;
}

export function OnboardingWizardV2({
  userId,
  businessId,
  existingBusiness,
  onComplete,
  onClose,
  triggerButton
}: OnboardingWizardV2Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (result: any) => {
    setIsOpen(false);
    if (onComplete) {
      onComplete(result);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const defaultTrigger = (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Create Business
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-[960px] max-h-[95vh] overflow-y-auto custom-scrollbar p-0">
        <OnboardingWizardV2Content
          userId={userId}
          businessId={businessId}
          existingBusiness={existingBusiness}
          onComplete={handleComplete}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}