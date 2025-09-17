'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Edit,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
  clients?: any[];
  businesses?: any[];
  created_at?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'archived';
}

interface OrganizationsListProps {
  organizations: Organization[];
}

const getStatusBadge = (status?: string) => {
  const normalizedStatus = status || 'active';
  
  const statusStyles = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
    archived: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive', 
    suspended: 'Suspended',
    archived: 'Archived',
  };

  return {
    style: statusStyles[normalizedStatus as keyof typeof statusStyles] || statusStyles.active,
    label: statusLabels[normalizedStatus as keyof typeof statusLabels] || statusLabels.active,
  };
};

export function OrganizationsList({ organizations }: OrganizationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize =
      selectedSize === 'all' || org.company_size === selectedSize;
    return matchesSearch && matchesSize;
  });

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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSize}
            onChange={e => setSelectedSize(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Sizes</option>
            <option value="startup">Startup</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrganizations.map(org => (
          <div
            key={org.id}
            className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {org.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <Link href={`/organizations/${org.slug || org.id}`} className="hover:underline">
                      <h3 className="font-semibold">{org.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {org.industry || 'No industry set'}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  getStatusBadge(org.status).style
                )}>
                  {getStatusBadge(org.status).label}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {org.website || org.slug || 'No description available'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {org.clients?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Clients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {org.businesses?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Businesses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <div className="flex gap-1">
                {/* Edit Button - Opens edit form */}
                <OrganizationForm
                  organization={org}
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
                      disabled={deletingId === org.id}
                    >
                      {deletingId === org.id ? (
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
                        Are you sure you want to delete "{org.name}"? This
                        action cannot be undone. All associated data including
                        businesses, clients, and projects will be permanently
                        removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(org.id, org.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={`/organizations/${org.slug || org.id}`}>
                  View Details
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first organization'}
          </p>
          <OrganizationForm
            trigger={
              <Button className="gap-2">
                <Building2 className="h-4 w-4" />
                Create Organization
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
