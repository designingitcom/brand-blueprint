'use client';

import { OnboardingWizard } from '@/components/forms/onboarding-wizard';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    // Save data and redirect to dashboard
    router.push('/dashboard');
  };

  const handleClose = () => {
    router.push('/');
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