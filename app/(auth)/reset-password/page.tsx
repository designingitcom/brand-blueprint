import { AuthCard } from "@/components/auth/auth-card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email address and we'll send you a link to reset your password"
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}