'use client';

import { OnboardingWizardV2Content } from '@/components/forms/onboarding-wizard-v2-content';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingV2Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

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

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handleComplete = (result: any) => {
    console.log('Onboarding completed:', result);
    router.push('/dashboard'); // Navigate to dashboard when completed
  };

  const handleClose = () => {
    router.push('/'); // Navigate to home page when closed
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizardV2Content
        userId={userId}
        onComplete={handleComplete}
        onClose={handleClose}
      />
    </div>
  );
}
