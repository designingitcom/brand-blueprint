import { Suspense } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Book,
  HelpCircle,
  Users,
  Shield,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      {children}
    </Suspense>
  );
}