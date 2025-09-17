import { getBusiness } from '@/app/actions/businesses';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import {
  ArrowLeft,
  Building2,
  Edit,
  Trash2,
  Copy,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BusinessDetailContent } from '@/components/business-detail-content';
import { getBusinessStatus } from '@/lib/utils/business-status';
import { BusinessForm } from '@/components/forms/business-form';

export const dynamic = 'force-dynamic';

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Load business data
  const { slug } = await params;
  const result = await getBusiness(slug);
  
  if (result.error || !result.data) {
    // If it's an authentication error, show loading state and let middleware redirect
    if (result.error === 'User not authenticated') {
      return (
        <DashboardLayout
          title="Loading..."
          subtitle="Checking access permissions..."
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading business...</p>
            </div>
          </div>
        </DashboardLayout>
      );
    }
    
    // For other errors (business not found, no access, etc.)
    return (
      <DashboardLayout
        title="Business Not Found"
        subtitle="The requested business could not be found"
      >
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Business Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The business you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/businesses">
            <Button variant="outline">Back to Businesses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const business = result.data;
  const businessStatus = getBusinessStatus(business);
  
  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats from real data
  const projects = business.projects || [];
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const businessStats = [
    { label: 'Active Projects', value: activeProjects.toString(), icon: Clock },
    { label: 'Completed Projects', value: completedProjects.toString(), icon: CheckCircle },
    { label: 'Total Projects', value: projects.length.toString(), icon: Building2 },
    { label: 'Team Members', value: '0', icon: Users },
  ];

  return (
    <DashboardLayout
      title={business.name}
      subtitle="Business overview and project management"
      actions={
        <div className="flex gap-2">
          <BusinessForm
            business={business}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            }
          />
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
        {/* Business Header */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => {
                      console.log(`Logo failed to load: ${business.logo_url}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{business.name}</h2>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                      businessStatus.style
                    )}>
                      {businessStatus.label}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-primary font-medium mb-2">
                {business.type || 'No type specified'}
              </p>
              {business.organization && (
                <Link
                  href={`/organizations/${business.organization.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary mb-3 inline-block"
                >
                  {business.organization.name}
                </Link>
              )}
              <p className="text-sm text-muted-foreground max-w-2xl">
                {business.description || 'No description available'}
              </p>
              {businessStatus.status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-500 mb-2">
                    {businessStatus.description}
                  </p>
                  <Button asChild size="sm">
                    <Link href={`/onboarding?business=${business.id}`} className="gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Start M0 Onboarding
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold">
                $0
              </p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                0%
              </p>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Created{' '}
                  {business.created_at 
                    ? new Date(business.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessStats.map(stat => (
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

        {/* Projects Section */}
        <BusinessDetailContent business={business} />
      </div>
    </DashboardLayout>
  );
}
