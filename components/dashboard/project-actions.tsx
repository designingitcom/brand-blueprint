'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { ProjectWizard } from '@/components/forms/project-wizard';
import { deleteProject } from '@/app/actions/projects';
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

interface Project {
  id: string;
  name: string;
  slug?: string;
  business_id?: string;
  code?: string;
  strategy_mode?: 'custom' | 'predefined';
  strategy_path_id?: string;
  base_project_id?: string;
  status?: 'active' | 'archived';
  description?: string;
}

interface ProjectActionsProps {
  project: Project;
  businesses?: Array<{ id: string; name: string; slug?: string }>;
}

export function ProjectActions({ project, businesses }: ProjectActionsProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const result = await deleteProject(project.id);
      
      if (result.error) {
        toast.error('Failed to delete project', {
          description: result.error,
        });
      } else {
        toast.success('Project deleted successfully', {
          description: `${project.name} has been permanently deleted.`,
        });
        // Refresh the page to update the dashboard
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete project', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-1">
      {/* Edit Button */}
      <ProjectWizard
        project={project}
        businesses={businesses}
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3 w-3" />
          </Button>
        }
        onSuccess={() => {
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action
              cannot be undone. All project data, modules, and deliverables will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}