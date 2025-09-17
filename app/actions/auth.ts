'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/send-email';

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  data?: any;
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  businessName?: string
): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          business_name: businessName || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      // Send welcome email through Resend
      try {
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${data.session?.access_token}`;
        await sendWelcomeEmail(email, firstName, verificationUrl);

        return {
          success: true,
          data: {
            message:
              'Please check your email to confirm your account before signing in.',
          },
        };
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Still consider signup successful even if email fails
        return {
          success: true,
          data: {
            message:
              'Account created successfully. You may need to verify your email manually.',
          },
        };
      }
    }

    revalidatePath('/', 'layout');
    return { success: true, data: data.user };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: data.user };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: { message: 'Logged out successfully' } };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function resetPassword(email: string): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      data: { message: 'Password reset email sent. Please check your inbox.' },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updatePassword(
  newPassword: string
): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      data: { message: 'Password updated successfully' },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function verifyEmail(token: string): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      data: { message: 'Email verified successfully', user: data.user },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { error: error.message };
    }

    return { success: true, data: user };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateProfile(updates: {
  firstName?: string;
  lastName?: string;
  businessName?: string;
}): Promise<AuthActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'User not authenticated' };
    }

    const updateData: Record<string, any> = {};

    if (updates.firstName) updateData.first_name = updates.firstName;
    if (updates.lastName) updateData.last_name = updates.lastName;
    if (updates.businessName) updateData.business_name = updates.businessName;

    if (updates.firstName && updates.lastName) {
      updateData.full_name = `${updates.firstName} ${updates.lastName}`;
    }

    const { error } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      data: { message: 'Profile updated successfully' },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
