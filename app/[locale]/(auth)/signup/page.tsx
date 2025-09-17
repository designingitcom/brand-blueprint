import { AuthCard } from '@/components/auth/auth-card';
import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Enter your details to get started with S1BMW"
    >
      <SignupForm />
    </AuthCard>
  );
}
