'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { OnboardingWizardV2 } from '@/components/forms/onboarding-wizard-v2';
import { deleteBusiness } from '@/app/actions/businesses';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Business {
  id: string;
  name: string;
  slug?: string;
  organization_id?: string;
  type?: string;
  description?: string;
  website?: string;
}

interface BusinessActionsProps {
  business: Business;
  organizations?: Array<{ id: string; name: string; slug: string }>;
}

export function BusinessActions({ business, organizations }: BusinessActionsProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const result = await deleteBusiness(business.id);
      
      if (result.error) {
        toast.error('Failed to delete business', {
          description: result.error,
        });
      } else {
        toast.success('Business deleted successfully', {
          description: `${business.name} has been permanently deleted.`,
        });
        // Refresh the page to update the dashboard
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete business', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-1">
      {/* Edit Button */}
      <OnboardingWizardV2
        existingBusiness={business}
        triggerButton={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3 w-3" />
          </Button>
        }
        onComplete={() => {
          window.location.reload();
        }}
      />

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{business.name}"? This action
              cannot be undone. All associated projects and data will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Business
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}