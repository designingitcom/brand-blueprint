import { AuthProvider } from "@/lib/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}