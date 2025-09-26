'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ComprehensiveOnboardingWizard } from '@/components/forms/comprehensive-onboarding-wizard';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleComplete = () => {
    router.push('/onboarding/project');
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Please wait while we prepare your onboarding"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <ComprehensiveOnboardingWizard
      userId={userId}
      isOpen={true}
      onClose={() => router.push('/businesses')}
      onComplete={handleComplete}
    />
  );
}
