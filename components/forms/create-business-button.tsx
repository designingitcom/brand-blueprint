'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';

interface CreateBusinessButtonProps {
  children?: React.ReactNode;
  existingBusiness?: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onComplete?: (business: any) => void;
}

export function CreateBusinessButton({
  children,
  existingBusiness,
  variant = 'default',
  size = 'default',
  className,
  onComplete,
}: CreateBusinessButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams();

    if (existingBusiness?.id) {
      params.set('businessId', existingBusiness.id);
    }

    // Navigate to full-page onboarding
    router.push(`/en/onboarding?${params.toString()}`);
  };

  if (children) {
    return (
      <button onClick={handleClick} className="contents">
        {children}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
    >
      {existingBusiness ? (
        <Edit className="h-4 w-4" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Create Business
        </>
      )}
    </Button>
  );
}
