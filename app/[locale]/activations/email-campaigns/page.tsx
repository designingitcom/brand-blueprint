'use client';

import { UnlockMessage } from '@/components/ui/unlock-message';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock function to check if user has completed foundation
const checkFoundationComplete = async (): Promise<boolean> => {
  // In real app, this would check user's completion status
  // For demo, we'll return false to show the unlock message
  return false;
};

export default function EmailCampaignsPage() {
  const router = useRouter();
  const [hasFoundation, setHasFoundation] = useState<boolean | null>(null);

  useEffect(() => {
    checkFoundationComplete().then(setHasFoundation);
  }, []);

  if (hasFoundation === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {!hasFoundation ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <UnlockMessage
              feature="Email Campaigns"
              description="Email campaigns need strategic context to be effective. Complete your foundation to create campaigns that align with your positioning and resonate with your target audience."
            />
          </div>
        ) : (
          // This is what users would see after completing foundation
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Email Campaigns
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Create targeted email campaigns based on your strategic foundation
            </p>
            <div className="p-6 border rounded-lg">
              <p className="text-muted-foreground">
                Email campaign builder would be here...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
