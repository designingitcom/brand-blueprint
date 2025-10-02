'use client';

import { adminMarkOnboardingComplete } from '@/app/actions/admin-fix-onboarding';
import { adminGenerateMissingSlugs } from '@/app/actions/admin-fix-slugs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function FixOnboardingPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [slugResult, setSlugResult] = useState<any>(null);
  const [slugLoading, setSlugLoading] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    const result = await adminMarkOnboardingComplete('hotel growth agency');
    setResult(result);
    setLoading(false);
  };

  const handleGenerateSlugs = async () => {
    setSlugLoading(true);
    const result = await adminGenerateMissingSlugs();
    setSlugResult(result);
    setSlugLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Fix Onboarding Status */}
      <div>
        <h1 className="text-2xl font-bold mb-4">Fix Onboarding Status</h1>
        <p className="text-muted-foreground mb-6">
          This will mark "hotel growth agency" as onboarding completed.
        </p>

        <Button onClick={handleFix} disabled={loading}>
          {loading ? 'Fixing...' : 'Mark as Completed'}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Generate Missing Slugs */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Generate Missing Slugs</h2>
        <p className="text-muted-foreground mb-6">
          This will auto-generate URL slugs for all businesses that don't have one.
        </p>

        <Button onClick={handleGenerateSlugs} disabled={slugLoading} variant="secondary">
          {slugLoading ? 'Generating...' : 'Generate Slugs'}
        </Button>

        {slugResult && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(slugResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
