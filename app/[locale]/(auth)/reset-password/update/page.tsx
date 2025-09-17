import { AuthCard } from '@/components/auth/auth-card';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Update your password"
      description="Enter your new password below"
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
