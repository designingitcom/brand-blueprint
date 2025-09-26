'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ComprehensiveOnboardingWizard } from './comprehensive-onboarding-wizard';
import { createClient } from '@/lib/supabase/client';
import { Plus, Building2 } from 'lucide-react';

interface ComprehensiveBusinessFormProps {
  onBusinessCreated?: (business?: any) => void;
  triggerButton?: React.ReactNode;
  existingBusiness?: any;
}

export function ComprehensiveBusinessForm({
  onBusinessCreated,
  triggerButton,
  existingBusiness,
}: ComprehensiveBusinessFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  const handleComplete = (business?: any) => {
    setIsOpen(false);
    if (onBusinessCreated) {
      onBusinessCreated(business);
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Add New Business
    </Button>
  );

  if (!userId) {
    return null;
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {triggerButton || defaultTrigger}
      </div>
      <ComprehensiveOnboardingWizard
        userId={userId}
        businessId={existingBusiness?.id}
        existingBusiness={existingBusiness}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
