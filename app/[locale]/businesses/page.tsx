'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  MoreVertical,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CreateBusinessButton } from '@/components/forms/create-business-button';
import { BusinessForm } from '@/components/forms/business-form';
import { TranslatedText } from '@/components/ui/translated-text';
import { deleteBusiness, getBusinesses } from '@/app/actions/businesses';
import { getOrganizations } from '@/app/actions/organizations';
import { toast } from 'sonner';
import { getBusinessStatus } from '@/lib/utils/business-status';
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

const BUSINESS_TYPES = [
  'Brand Design',
  'Digital Marketing',
  'Web Development',
  'Technology Consulting',
  'R&D',
  'Incubation',
];

const getStatusBadge = (business: any) => {
  const statusInfo = getBusinessStatus(business);
  return {
    style: statusInfo.style,
    label: statusInfo.label,
    description: statusInfo.description
  };
};

export default function BusinessesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [businessResult, orgResult] = await Promise.all([
          getBusinesses(),
          getOrganizations()
        ]);

        if (businessResult.error) {
          setError(businessResult.error);
        } else {
          setBusinesses(businessResult.data || []);
        }

        if (orgResult.success && orgResult.data) {
          setOrganizations(orgResult.data);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredBusinesses = businesses.filter(biz => {
    const matchesSearch =
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.organization?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || biz.type === selectedType;
    const matchesOrg =
      selectedOrganization === 'all' ||
      biz.organization?.id === selectedOrganization;
    return matchesSearch && matchesType && matchesOrg;
  });

  // Calculate stats from real data
  const businessStats = [
    { label: t('businesses.totalBusinesses'), value: businesses.length.toString(), icon: Briefcase },
    { label: t('businesses.activeProjects'), value: '0', icon: Building2 },
    { label: t('businesses.teamMembers'), value: '0', icon: Users },
    { label: t('businesses.totalRevenue'), value: '$0', icon: DollarSign },
  ];

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
        // Remove from local state instead of reloading
        setBusinesses(prev => prev.filter(b => b.id !== businessId));
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
    <DashboardLayout
      title={t('businesses.title')}
      subtitle={t('businesses.subtitle', 'Manage all businesses across organizations')}
      actions={
        <CreateBusinessButton>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('businesses.create')}
          </Button>
        </CreateBusinessButton>
      }
    >
      <div className="space-y-8">
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('businesses.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedOrganization}
              onChange={e => setSelectedOrganization(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">{t('businesses.allOrganizations')}</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">{t('businesses.allTypes')}</option>
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

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('businesses.loadingBusinesses')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('businesses.errorLoading')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>{t('businesses.tryAgain')}</Button>
          </div>
        ) : (
          /* Businesses Grid */
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
                        <Link href={`/businesses/${business.slug || business.id}`} className="hover:underline">
                          <h3 className="font-semibold text-lg">
                            <TranslatedText context="business name">{business.name}</TranslatedText>
                          </h3>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-primary mb-1">
                        <TranslatedText context="business type">{business.type || 'No type'}</TranslatedText>
                      </p>
                      <Link
                        href={`/organizations/${business.organization?.slug || business.organization?.id}`}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        <TranslatedText context="organization name">
                          {business.organization?.name || 'No organization'}
                        </TranslatedText>
                      </Link>
                    </div>
                    {(() => {
                      const statusBadge = getStatusBadge(business);
                      return (
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                            statusBadge.style
                          )}
                          title={statusBadge.description}
                        >
                          {statusBadge.label}
                        </span>
                      );
                    })()}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    <TranslatedText context="business description">
                      {business.description || 'No description provided'}
                    </TranslatedText>
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xl font-bold">
                        {business.projects?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Projects
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">
                        Team Members
                      </p>
                    </div>
                  </div>

                  {/* Created date */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(business.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                  <div className="flex gap-1">
                    <BusinessForm
                      business={business}
                      organizations={organizations}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                      }
                      onSuccess={(updatedBusiness) => {
                        setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
                      }}
                    />
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
                            Are you sure you want to delete "{business.name}"? This action
                            cannot be undone. All associated projects and data will be
                            permanently removed.
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
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={`/businesses/${business.slug || business.id}`}>
                      View Details
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first business'}
            </p>
            <CreateBusinessButton />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}