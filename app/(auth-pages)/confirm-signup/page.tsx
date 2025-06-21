'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import Link from "next/link";

export default function ConfirmSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Get the confirmation URL from query parameters
  const confirmationUrl = searchParams.get('confirmation_url');
  
  useEffect(() => {
    // If no confirmation URL is provided, redirect to sign-in
    if (!confirmationUrl) {
      setError('Invalid confirmation link. Please check your email for the correct link.');
    }
  }, [confirmationUrl]);

  const handleConfirmSignup = async () => {
    if (!confirmationUrl) {
      setError('No confirmation URL provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse the confirmation URL to extract the token
      const url = new URL(confirmationUrl);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');

      if (!token) {
        throw new Error('Invalid confirmation link: missing token');
      }

      // Confirm the signup using Supabase
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any || 'signup',
      });

      if (error) {
        throw error;
      }

      setIsConfirmed(true);
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/sign-in?message=Email confirmed successfully. Please sign in.');
      }, 2000);

    } catch (err: any) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Failed to confirm email. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="flex-1 flex flex-col min-w-64">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-medium">Email Confirmed!</h1>
          <p className="text-sm text-foreground mt-2">
            Your email has been successfully confirmed. Redirecting you to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Confirm Your Email</h1>
      <p className="text-sm text-foreground">
        Please click the button below to confirm your email address and complete your registration.
      </p>

      <div className="flex flex-col gap-2 mt-8">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleConfirmSignup}
          disabled={isLoading || !confirmationUrl}
          className="w-full"
        >
          {isLoading ? 'Confirming...' : 'Confirm Email Address'}
        </Button>

        <p className="text-xs text-foreground text-center mt-4">
          Having trouble?{" "}
          <Link
            className="text-foreground font-medium underline"
            href="/sign-in"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 