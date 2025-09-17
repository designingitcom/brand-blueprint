import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import {
  Plus,
  Building2,
  Users,
  Briefcase,
  Edit,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { OrganizationForm } from '@/components/forms/organization-form';
import { OrganizationsList } from '@/components/organizations-list';
import { getOrganizations } from '@/app/actions/organizations';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

async function getOrganizationsData() {
  const result = await getOrganizations();
  const organizations = result.success ? result.data : [];

  // Calculate stats from real data
  const totalOrgs = organizations.length;
  const totalBusinesses = organizations.reduce((sum: number, org: any) => {
    return sum + (org.businesses?.length || 0);
  }, 0);
  const totalClients = organizations.reduce((sum: number, org: any) => {
    return sum + (org.clients?.length || 0);
  }, 0);

  return {
    organizations,
    stats: [
      {
        label: 'Total Organizations',
        value: totalOrgs.toString(),
        change: 0,
        icon: Building2,
      },
      {
        label: 'Total Clients',
        value: totalClients.toString(),
        change: 0,
        icon: FileText,
      },
      {
        label: 'Total Businesses',
        value: totalBusinesses.toString(),
        change: 0,
        icon: Building2,
      },
      { label: 'Monthly Revenue', value: '$0', change: 0, icon: Briefcase },
    ],
  };
}

export default async function OrganizationsPage() {
  const { organizations, stats } = await getOrganizationsData();

  return (
    <DashboardLayout
      title="Organizations"
      subtitle="Manage all organizations and their businesses"
      actions={
        <OrganizationForm
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          }
        />
      }
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
            <KPICard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              changeLabel="this month"
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Organizations List */}
        <OrganizationsList organizations={organizations} />
      </div>
    </DashboardLayout>
  );
}
