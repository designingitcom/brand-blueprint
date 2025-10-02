'use client';

import Link from 'next/link';
import { Settings, Palette, Webhook, User, Bell, Shield, Database } from 'lucide-react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your application settings and preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Style Guide */}
          <Link
            href="/en/styleguide"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Style Guide</h3>
                <p className="text-sm text-gray-600">View design system, components, and UI patterns</p>
              </div>
            </div>
          </Link>

          {/* Lindy Monitoring */}
          <Link
            href="/en/admin/lindy-monitor"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-green-500"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Webhook className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Lindy Monitor</h3>
                <p className="text-sm text-gray-600">Monitor AI webhook activity and responses</p>
              </div>
            </div>
          </Link>

          {/* Test Lindy */}
          <Link
            href="/en/admin/test-lindy"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-purple-500"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Test Lindy</h3>
                <p className="text-sm text-gray-600">Trigger Lindy AI for testing and debugging</p>
              </div>
            </div>
          </Link>

          {/* Account Settings (placeholder) */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 opacity-60 cursor-not-allowed">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Settings</h3>
                <p className="text-sm text-gray-600">Manage profile and preferences (Coming soon)</p>
              </div>
            </div>
          </div>

          {/* Notifications (placeholder) */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 opacity-60 cursor-not-allowed">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Notifications</h3>
                <p className="text-sm text-gray-600">Configure notification preferences (Coming soon)</p>
              </div>
            </div>
          </div>

          {/* Security (placeholder) */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 opacity-60 cursor-not-allowed">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Security</h3>
                <p className="text-sm text-gray-600">Password and security settings (Coming soon)</p>
              </div>
            </div>
          </div>

          {/* Database (placeholder) */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 opacity-60 cursor-not-allowed">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Database className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Database</h3>
                <p className="text-sm text-gray-600">View and manage data (Coming soon)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Development Tools</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li><strong>Style Guide:</strong> Design system reference and component library</li>
            <li><strong>Lindy Monitor:</strong> Real-time webhook activity tracking with request/response details</li>
            <li><strong>Test Lindy:</strong> Manual trigger interface for testing AI integrations</li>
          </ul>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
