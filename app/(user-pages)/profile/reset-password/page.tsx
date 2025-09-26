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

  // Only allow access if authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.push("/sign-in?error=You must be signed in to change your password.");
      }
    });
  }, [router, supabase]);

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

  return (
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
  );
}