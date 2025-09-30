'use client';

import { OnboardingWizardV3Simple } from '@/components/forms/onboarding-wizard-v3-simple';
import { useRouter } from 'next/navigation';

export default function OnboardingV3SimplePage() {
  const router = useRouter();

  const handleComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    // Here you would typically save the data and redirect
    alert('Onboarding completed! Check console for data.');
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div>
      <OnboardingWizardV3Simple
        onComplete={handleComplete}
        onClose={handleClose}
      />
    </div>
  );
}