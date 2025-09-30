import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { KPICard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Activity,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { ActionDropdown } from '@/components/ui/action-dropdown';
import { getOrganizations } from '@/app/actions/organizations';
import { getBusinesses } from '@/app/actions/businesses';
import { getProjects } from '@/app/actions/projects';
import { DashboardOrganizationActions } from '@/components/dashboard/organization-actions';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [orgsResult, businessesResult, projectsResult] = await Promise.all([
    getOrganizations(),
    getBusinesses(),
    getProjects()
  ]);
  
  let organizations = orgsResult.success ? orgsResult.data : [];
  const businesses = businessesResult.success ? businessesResult.data : [];
  const projects = projectsResult.success ? projectsResult.data : [];

  // Sort by created_at (most recent first) or updated_at if available
  organizations = organizations.sort((a: any, b: any) => {
    const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
    const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
    return dateB - dateA; // Most recent first
  });

  // Calculate KPIs from real data
  const totalOrgs = organizations.length;
  const totalUsers = organizations.reduce((sum: number, org: any) => {
    return sum + (org.memberships_all?.length || 0);
  }, 0);

  // Calculate stats
  const totalBusinesses = businesses.length;
  const totalProjects = projects.length;
  const businessesWithOnboarding = businesses.filter(b => b.onboarding_completed).length;
  const onboardingRate = totalBusinesses > 0 ? (businessesWithOnboarding / totalBusinesses) * 100 : 0;

  // Map businesses with organization names for the table
  const businessesWithOrgNames = businesses.map(business => ({
    ...business,
    organization_name: business.organization?.name || 'Unknown Organization'
  }));

  return {
    kpis: [
      {
        label: 'Organizations',
        value: totalOrgs.toString(),
        change: 0,
        icon: Building2,
      },
      {
        label: 'Businesses',
        value: totalBusinesses.toString(),
        change: 0,
        icon: Users,
      },
      {
        label: 'Projects',
        value: totalProjects.toString(),
        change: 0,
        icon: FileText,
      },
      { 
        label: 'Onboarding Rate', 
        value: `${Math.round(onboardingRate)}%`, 
        change: 0, 
        icon: Activity 
      },
    ],
    organizations: organizations.slice(0, 10), // Show most recent 10 organizations
    totalOrganizations: totalOrgs, // Pass total count for display
    businesses: businessesWithOrgNames, // Pass businesses with organization names
  };
}

export default async function DashboardPage() {
  const { kpis, organizations, totalOrganizations, businesses } = await getDashboardData();

  return (
    <DashboardLayout
      title="Platform Overview"
      subtitle="Global system administration and analytics"
      actions={<ActionDropdown />}
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map(kpi => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              changeLabel="this month"
              icon={kpi.icon}
            />
          ))}
        </div>

        {/* Organizations Table */}
        <div className="bg-card rounded-2xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold">Organizations</h2>
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(10, totalOrganizations)} of {totalOrganizations} organizations
              </p>
            </div>
            <Link href="/organizations">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Organization
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Businesses
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Members
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No organizations found. Create your first organization to
                      get started!
                    </td>
                  </tr>
                ) : (
                  organizations.map((org: any) => (
                    <tr
                      key={org.id}
                      className="border-b border-border hover:bg-secondary/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {org.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <Link href={`/organizations/${org.slug || org.id}`} className="hover:underline">
                              <p className="font-medium">{org.name}</p>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {org.website || org.slug || 'No website'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {org.businesses?.length || 0}
                      </td>
                      <td className="p-4 text-sm">
                        {org.memberships_all?.length || 1}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          {org.company_size || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Active
                        </span>
                      </td>
                      <td className="p-4">
                        <DashboardOrganizationActions organization={org} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Businesses Table - Temporarily removed */}
        {/* <BusinessOnboardingTable businesses={businesses} /> */}

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Platform Health */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium text-green-500">
                  99.9%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Response Time
                </span>
                <span className="text-sm font-medium">127ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  AI Satisfaction
                </span>
                <span className="text-sm font-medium text-green-500">94%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">
                  New project created
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground">
                  Module M2 completed
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">
                  AI features updated
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/workshop/demo-project" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Demo Workshop
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Activity className="h-4 w-4" />
                System Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Clock className="h-4 w-4" />
                Usage Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
