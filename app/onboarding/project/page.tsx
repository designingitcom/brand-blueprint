'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { ProjectSetup } from '../components/project-setup';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ProjectOnboardingPage() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/team');
  };

  const handleBack = () => {
    router.push('/onboarding/business');
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <DashboardLayout
      title="Create Your First Project"
      subtitle="Set up your first brand project to start tracking"
    >
      <div className="bg-muted/30 -mx-6 -my-6 min-h-screen p-6">
        <div className="mx-auto max-w-2xl">
          <ProjectSetup
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />

          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Business Setup
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button onClick={handleNext}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
