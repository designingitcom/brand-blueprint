'use client';

import { BuildFromScratchWizard } from '@/components/forms/onboarding/build-from-scratch-wizard';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function BuildFromScratchPage() {
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

  const handleClose = () => {
    router.push('/'); // Navigate to home page when closed
  };

  const handleComplete = (result: any) => {
    console.log('Build from scratch onboarding completed:', result);
    // Route based on the selected starting point
    switch (result.startingPoint) {
      case 'brand_new':
      case 'complete_rebrand':
        router.push('/modules/1'); // Module 1: Foundation
        break;
      case 'need_research':
        router.push('/modules/9'); // Module 9: Research
        break;
      case 'not_sure':
        router.push('/diagnostic'); // Diagnostic tool
        break;
      default:
        router.push('/dashboard');
    }
  };

  return (
    <BuildFromScratchWizard
      userId={userId}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
}
