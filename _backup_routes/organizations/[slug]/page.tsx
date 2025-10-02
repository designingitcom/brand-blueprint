import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import {
  ArrowLeft,
  Plus,
  Building2,
  Users,
  Briefcase,
  Globe,
  Calendar,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import { getOrganization } from '@/app/actions/organizations';
import { redirect, notFound } from 'next/navigation';
import { getBusinessStatus } from '@/lib/utils/business-status';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

interface OrganizationDetailPageProps {
  params: {
    slug: string;
  };
}

async function getOrganizationData(slug: string) {
  const result = await getOrganization(slug);

  if (!result.success || result.error) {
    console.log(`Organization lookup failed for "${slug}":`, result.error);
    
    // If the error is about authentication, let middleware handle the redirect
    // Only call notFound() for actual "organization not found" cases
    if (result.error === 'User not authenticated') {
      // Return null to let middleware handle authentication redirect
      return null;
    }
    
    // For any other error, show 404
    notFound();
  }

  return result.data;
}

export default async function OrganizationDetailPage({
  params,
}: OrganizationDetailPageProps) {
  const { slug } = await params;
  const organization = await getOrganizationData(slug);

  if (!organization) {
    // If organization is null due to authentication issues, 
    // show a loading state and let middleware handle the redirect
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Checking access permissions..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading organization...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate KPIs from real data
  const businessesCount = organization.businesses?.length || 0;
  const membersCount = organization.memberships_all?.length || 0;

  return (
    <DashboardLayout
      title={organization.name}
      subtitle={`${organization.industry || 'Organization'} • ${organization.company_size || 'Unknown size'}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Copy className="h-4 w-4" />
            Clone
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            label="Businesses"
            value={businessesCount.toString()}
            change={0}
            changeLabel="this month"
            icon={Building2}
          />
          <KPICard
            label="Team Members"
            value={membersCount.toString()}
            change={0}
            changeLabel="this month"
            icon={Users}
          />
          <KPICard
            label="Revenue"
            value="$0"
            change={0}
            changeLabel="this month"
            icon={Calendar}
          />
        </div>

        {/* Organization Details */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Organization Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Name
              </h3>
              <p className="text-sm">{organization.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Slug
              </h3>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {organization.slug}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Industry
              </h3>
              <p className="text-sm">
                {organization.industry || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Company Size
              </h3>
              <p className="text-sm">
                {organization.company_size || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Website
              </h3>
              {organization.website ? (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {organization.website}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Timezone
              </h3>
              <p className="text-sm">
                {organization.timezone || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Businesses Table */}
        {organization.businesses && organization.businesses.length > 0 && (
          <div className="bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Businesses</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Business
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {organization.businesses.map((business: any) => {
                    const statusInfo = getBusinessStatus(business);
                    return (
                      <tr
                        key={business.id}
                        className="border-b border-border hover:bg-secondary/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {business.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <Link href={`/businesses/${business.slug || business.id}`} className="hover:underline">
                                <p className="font-medium">{business.name}</p>
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit ${
                              statusInfo.status === 'active' 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : statusInfo.status === 'inactive'
                                ? 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                : statusInfo.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                : statusInfo.status === 'onboarding'
                                ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {statusInfo.label}
                            </span>
                            {statusInfo.status === 'onboarding' && business.onboarding_current_step && (
                              <span className="text-xs text-muted-foreground">
                                Step {business.onboarding_current_step}/5
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {business.created_at
                            ? new Date(business.created_at).toLocaleDateString()
                            : 'Unknown'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Team Members */}
        {organization.memberships_all &&
          organization.memberships_all.length > 0 && (
            <div className="bg-card rounded-2xl border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Team Members</h2>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Member
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {organization.memberships_all.map((membership: any) => (
                      <tr
                        key={membership.id}
                        className="border-b border-border hover:bg-secondary/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {membership.users?.name?.charAt(0) ||
                                  membership.users?.email?.charAt(0) ||
                                  'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {membership.users?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {membership.users?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 capitalize">
                            {membership.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          {membership.created_at
                            ? new Date(
                                membership.created_at
                              ).toLocaleDateString()
                            : 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
