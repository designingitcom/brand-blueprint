'use client';

import { ReactNode } from 'react';

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  // For now, just render children without any guard logic
  // This can be enhanced later with actual onboarding logic
  return <>{children}</>;
}