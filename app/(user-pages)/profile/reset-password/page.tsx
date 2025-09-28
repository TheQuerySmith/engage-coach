"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [canShowForm, setCanShowForm] = useState(false);
  const [checking, setChecking] = useState(true);

  // Read token_hash and type from query string
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Check if user is signed in or has a valid OTP
  useEffect(() => {
    let cancelled = false;
    async function checkAuthOrOtp() {
      setChecking(true);
      setError(null);

      // 1. Try to get user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (!cancelled) {
          setCanShowForm(true);
          setChecking(false);
        }
        return;
      }

      // 2. If not signed in, try OTP verification if params exist
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });
        if (!cancelled) {
          if (error) {
            setError("Invalid or expired link. Please request a new password reset.");
            setCanShowForm(false);
          } else {
            setCanShowForm(true);
          }
          setChecking(false);
        }
        return;
      }

      // 3. Not signed in and no OTP
      if (!cancelled) {
        setError("You must be signed in to change your password");
        setCanShowForm(false);
        setChecking(false);
      }
    }
    checkAuthOrOtp();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token_hash, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError("Password and confirm password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message || "Password update failed.");
    } else {
      setSuccess("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-lg text-foreground/70">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div>
      {canShowForm ? (
        <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-medium">Change Password</h1>
          <p className="text-sm text-foreground/60">
            Enter your new password below.
          </p>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 mb-2">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 rounded p-2 mb-2">
              {success}
            </div>
          )}
          <Label htmlFor="password">New password</Label>
          <Input
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
          />
          <SubmitButton>Change Password</SubmitButton>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <h1 className="text-2xl font-medium mb-2">Reset Password</h1>
          <p className="text-red-700">{error || "You are not authorized to reset the password."}</p>
        </div>
      )}
    </div>
  );
}