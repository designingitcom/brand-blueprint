'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllBusinessesWithOrganizations, getAllOrganizations, setBusinessOrganization } from '@/app/actions/admin-business';
import { Building2, Users } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  organization_id: string | null;
  organization?: { id: string; name: string } | null;
  user?: { id: string; email: string } | null;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function BusinessOrganizationsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [businessesResult, orgsResult] = await Promise.all([
      getAllBusinessesWithOrganizations(),
      getAllOrganizations(),
    ]);

    if (businessesResult.success) {
      setBusinesses(businessesResult.businesses);
    }

    if (orgsResult.success) {
      setOrganizations(orgsResult.organizations);
    }

    setLoading(false);
  };

  const handleOrganizationChange = async (businessId: string, organizationId: string) => {
    setUpdating(businessId);

    const result = await setBusinessOrganization(
      businessId,
      organizationId === 'none' ? null : organizationId
    );

    if (result.success) {
      // Refresh data
      await fetchData();
    } else {
      alert(`Failed to update: ${result.error}`);
    }

    setUpdating(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading businesses...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Organizations</h1>
            <p className="text-gray-600">Manage organization assignments for businesses</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold">{businesses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned to Orgs</p>
                  <p className="text-2xl font-bold">
                    {businesses.filter(b => b.organization_id).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold">
                    {businesses.filter(b => !b.organization_id).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Businesses Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assign Organization
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businesses.map((business) => (
                    <tr key={business.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {business.name || <span className="text-gray-400 italic">Unnamed</span>}
                        </div>
                        <div className="text-xs text-gray-500">ID: {business.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {business.user?.email || <span className="text-gray-400 italic">No user</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {business.organization ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {business.organization.name}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={business.organization_id || 'none'}
                          onValueChange={(value) => handleOrganizationChange(business.id, value)}
                          disabled={updating === business.id}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-gray-500">No organization</span>
                            </SelectItem>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {businesses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses</h3>
              <p className="mt-1 text-sm text-gray-500">No businesses have been created yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
