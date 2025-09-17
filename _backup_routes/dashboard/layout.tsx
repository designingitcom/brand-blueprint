import { Suspense } from 'react';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading dashboard...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

export const metadata = {
  title: 'Dashboard - Brand Blueprint',
  description: 'Manage your brand development and business strategy'
};