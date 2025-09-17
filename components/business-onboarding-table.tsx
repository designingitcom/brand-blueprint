'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Clock,
  Building2,
  Users,
  ArrowRight,
  BookOpen,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { ActionDropdown } from '@/components/ui/action-dropdown';
import { getBusinessStatus } from '@/lib/utils/business-status';

interface BusinessOnboardingTableProps {
  showAll?: boolean;
  businesses: Array<{
    id: string;
    name: string;
    slug: string;
    onboarding_completed?: boolean;
    organization_name?: string;
    client_name?: string;
    client_email?: string;
    created_at?: string;
    team_size?: number;
    description?: string;
    website?: string;
    last_activity_at?: string;
    logo_url?: string;
  }>;
}

export function BusinessOnboardingTable({ businesses, showAll = false }: BusinessOnboardingTableProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'onboarding'>('all');
  
  // Get business statuses using our proper logic
  const businessesWithStatus = businesses.map(business => ({
    ...business,
    statusInfo: getBusinessStatus(business)
  }));
  
  const activeCount = businessesWithStatus.filter(b => b.statusInfo.status === 'active').length;
  const onboardingCount = businessesWithStatus.filter(b => b.statusInfo.status === 'onboarding').length;
  const pendingCount = businessesWithStatus.filter(b => b.statusInfo.status === 'pending').length;
  
  // Filter businesses based on selected filter
  const filteredBusinesses = businessesWithStatus.filter(business => {
    if (filter === 'active') return business.statusInfo.status === 'active';
    if (filter === 'pending') return business.statusInfo.status === 'pending';
    if (filter === 'onboarding') return business.statusInfo.status === 'onboarding';
    return true;
  });
  
  // Limit to 10 unless showAll is true
  const displayedBusinesses = showAll ? filteredBusinesses : filteredBusinesses.slice(0, 10);
  const totalFilteredCount = filteredBusinesses.length;

  if (businesses.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border">
        <div className="p-6 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Businesses Yet</h3>
          <p className="text-muted-foreground">
            Create businesses to track their onboarding progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">Businesses</h2>
          <p className="text-sm text-muted-foreground">
            {showAll ? `Showing all ${totalFilteredCount} businesses` : `Showing ${Math.min(10, totalFilteredCount)} of ${businesses.length} businesses`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}
            className="gap-1.5"
          >
            <CheckCircle className="h-3 w-3" />
            {activeCount} Active
          </Button>
          <Button
            variant={filter === 'onboarding' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filter === 'onboarding' ? 'all' : 'onboarding')}
            className="gap-1.5"
          >
            <Clock className="h-3 w-3" />
            {onboardingCount} Onboarding
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
            className="gap-1.5"
          >
            <Clock className="h-3 w-3" />
            {pendingCount} Pending
          </Button>
          {!showAll && (
            <Link href="/businesses">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                Business
              </th>
              <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                Organization
              </th>
              <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                Client
              </th>
              <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                Team
              </th>
              <th className="text-right py-4 px-6 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedBusinesses.map((business) => (
              <tr
                key={business.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/50"
              >
                {/* Business Name */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={`${business.name} logo`}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <Link href={`/businesses/${business.slug}`} className="hover:underline">
                        <div className="font-medium">{business.name}</div>
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {business.slug}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Organization */}
                <td className="py-4 px-6">
                  <div className="text-sm">
                    {business.organization_name || (
                      <span className="text-muted-foreground">No organization</span>
                    )}
                  </div>
                </td>

                {/* Client */}
                <td className="py-4 px-6">
                  {business.client_name ? (
                    <div>
                      <div className="text-sm font-medium">{business.client_name}</div>
                      {business.client_email && (
                        <div className="text-xs text-muted-foreground">
                          {business.client_email}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No client</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <Badge className={`gap-1.5 ${business.statusInfo.style}`}>
                    {business.statusInfo.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {business.statusInfo.label}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {business.statusInfo.description}
                  </div>
                </td>

                {/* Team Size */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{business.team_size || 1}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    {business.statusInfo.status !== 'active' ? (
                      <>
                        <Link href={`/dashboard/onboarding?business=${business.id}`}>
                          <Button size="sm" className="gap-1.5">
                            <BookOpen className="h-3 w-3" />
                            {business.statusInfo.status === 'onboarding' ? 'Continue Onboarding' : 'Start Onboarding'}
                          </Button>
                        </Link>
                        <Link href={`/businesses/${business.slug}/invite`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Mail className="h-3 w-3" />
                            Invite Team
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link href={`/businesses/${business.slug}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ArrowRight className="h-3 w-3" />
                          View Business
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}