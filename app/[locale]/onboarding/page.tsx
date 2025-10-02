'use client';

import { OnboardingWizard } from '@/components/forms/onboarding-wizard';
import { useRouter } from 'next/navigation';
import { completeOnboarding, getOrCreateBusiness } from '@/app/actions/save-onboarding';
import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Get or create business on mount
  useEffect(() => {
    async function initBusiness() {
      const result = await getOrCreateBusiness();
      if (result.success && result.businessId) {
        setBusinessId(result.businessId);
      }
    }
    initBusiness();
  }, []);

  const handleComplete = async (data: any) => {
    console.log('Onboarding completed with data:', data);

    // Mark onboarding as completed in database
    if (businessId) {
      const result = await completeOnboarding(businessId);
      if (result.success) {
        console.log('✅ Onboarding status updated successfully');
      } else {
        console.error('❌ Failed to update onboarding status:', result.error);
      }
    }

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  return (
    <div>
      <OnboardingWizard
        onComplete={handleComplete}
        onClose={handleClose}
      />
    </div>
  );
}