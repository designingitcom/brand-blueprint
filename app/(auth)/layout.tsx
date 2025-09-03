import { AuthProvider } from "@/lib/contexts/auth-context"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-muted/30">
        {children}
      </div>
    </AuthProvider>
  )
}