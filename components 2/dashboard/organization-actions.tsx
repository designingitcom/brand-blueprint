'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { OrganizationForm } from '@/components/forms/organization-form';
import { deleteOrganization } from '@/app/actions/organizations';
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

interface Organization {
  id: string;
  name: string;
  slug?: string;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  timezone?: string;
}

interface DashboardOrganizationActionsProps {
  organization: Organization;
}

export function DashboardOrganizationActions({
  organization,
}: DashboardOrganizationActionsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (orgId: string, orgName: string) => {
    setDeletingId(orgId);

    try {
      const result = await deleteOrganization(orgId);

      if (result.error) {
        toast.error('Failed to delete organization', {
          description: result.error,
        });
      } else {
        toast.success('Organization deleted successfully', {
          description: `${orgName} has been permanently deleted.`,
        });
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete organization', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit Button - Opens edit form */}
      <OrganizationForm
        organization={organization}
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3 w-3" />
          </Button>
        }
      />

      {/* Delete Button - Shows confirmation dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            disabled={deletingId === organization.id}
          >
            {deletingId === organization.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{organization.name}"? This action
              cannot be undone. All associated data including clients, projects,
              and members will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(organization.id, organization.name)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
