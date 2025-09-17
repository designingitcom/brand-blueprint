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
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BusinessForm } from '@/components/forms/business-form';
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
  organization?: string;
  organization_slug?: string;
  type?: string;
  description?: string;
  logo_url?: string;
  projects_count?: number;
  active_projects?: number;
  completed_projects?: number;
  team_members?: number;
  created_at?: string;
  status?: string;
  status_enum?: 'pending' | 'onboarding' | 'active' | 'inactive' | 'suspended';
  onboarding_completed?: boolean;
  revenue?: number;
  growth?: number;
}

interface BusinessesListProps {
  businesses: Business[];
  organizations?: Array<{ id: string; name: string; slug: string }>;
  searchQuery?: string;
  selectedType?: string;
  selectedOrganization?: string;
  onSearchChange?: (query: string) => void;
  onTypeChange?: (type: string) => void;
  onOrganizationChange?: (org: string) => void;
}

const BUSINESS_TYPES = [
  'Brand Design',
  'Digital Marketing',
  'Web Development',
  'Technology Consulting',
  'Product Design',
  'Content Creation',
  'Social Media',
  'SEO & SEM',
  'E-commerce',
  'Business Strategy',
  'Creative Services',
  'Development',
  'Consulting',
  'Agency',
  'Freelance',
  'Other',
];

export function BusinessesList({
  businesses,
  organizations = [],
  searchQuery = '',
  selectedType = 'all',
  selectedOrganization = 'all',
  onSearchChange,
  onTypeChange,
  onOrganizationChange,
}: BusinessesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredBusinesses = businesses.filter(biz => {
    const matchesSearch =
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.organization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || biz.type === selectedType;
    const matchesOrg =
      selectedOrganization === 'all' ||
      biz.organization_slug === selectedOrganization;
    return matchesSearch && matchesType && matchesOrg;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async (businessId: string, businessName: string) => {
    setDeletingId(businessId);

    try {
      const result = await deleteBusiness(businessId);

      if (result.error) {
        toast.error('Failed to delete business', {
          description: result.error,
        });
      } else {
        toast.success('Business deleted successfully', {
          description: `${businessName} has been permanently deleted.`,
        });
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete business', {
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
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedOrganization}
            onChange={e => onOrganizationChange?.(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Organizations</option>
            {organizations.map(org => (
              <option key={org.slug} value={org.slug}>
                {org.name}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={e => onTypeChange?.(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBusinesses.map(business => (
          <div
            key={business.id}
            className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={`${business.name} logo`}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        onError={() => console.log(`Logo failed to load: ${business.logo_url}`)}
                        onLoad={() => console.log(`Logo loaded successfully: ${business.logo_url}`)}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{business.name}</h3>
                  </div>
                  <p className="text-sm text-primary mb-1">{business.type}</p>
                  {business.organization && (
                    <Link
                      href={`/organizations/${business.organization_slug}`}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {business.organization}
                    </Link>
                  )}
                </div>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    (business.status_enum === 'active' || business.onboarding_completed === true)
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : business.status_enum === 'onboarding'
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      : business.status_enum === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                  )}
                >
                  {business.status_enum === 'pending' ? 'Pending Setup' : 
                   business.status_enum === 'onboarding' ? 'Onboarding' :
                   business.status_enum === 'active' ? 'Active' :
                   business.status || 'pending'}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {business.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xl font-bold">
                    {business.active_projects || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active Projects
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold">{business.team_members || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Team Members
                  </p>
                </div>
              </div>

              {/* Revenue and Growth */}
              {business.revenue && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">
                      {formatCurrency(business.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  {business.growth !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp
                        className={cn(
                          'h-3 w-3',
                          business.growth >= 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs font-medium',
                          business.growth >= 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {business.growth >= 0 ? '+' : ''}
                        {business.growth}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <div className="flex gap-1">
                {/* Edit Button */}
                <BusinessForm
                  business={business}
                  organizations={organizations}
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
                      disabled={deletingId === business.id}
                    >
                      {deletingId === business.id ? (
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
                        Are you sure you want to delete "{business.name}"? This
                        action cannot be undone. All associated projects and data
                        will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(business.id, business.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Business
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex gap-2">
                {/* Show Start Onboarding for pending businesses */}
                {(business.status_enum === 'pending' || business.onboarding_completed === false) && (
                  <Button asChild variant="default" size="sm" className="gap-2">
                    <Link href={`/onboarding?business=${business.id}`}>
                      Start Onboarding
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/businesses/${business.slug || business.id}`}>
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first business'}
          </p>
          <BusinessForm
            organizations={organizations}
            trigger={
              <Button className="gap-2">
                <Building2 className="h-4 w-4" />
                Create Business
              </Button>
            }
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </div>
      )}
    </div>
  );
}