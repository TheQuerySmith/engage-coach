// app/profile/update/UpdateForm.tsx
"use client";

import { useState, useTransition, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from 'react-toastify';

interface Props {
  /** `profiles.id` (same as auth user id) */
  userId: string;
  /** Current value coming from the DB (can be null) */
  initialDepartment: string | null;
}

export default function UpdateForm({ userId, initialDepartment }: Props) {
  const [dept, setDept] = useState(initialDepartment ?? "");
  const [pending, startTransition] = useTransition();
  const supabase = createClient();


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Basic front‑end validation
    const clean = dept.trim();
    if (!clean) {
      toast.error("Department can’t be empty");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          department: clean,
          user_edited: true,                     // optional, matches your schema
          updated_at: new Date().toISOString(),  // keep your audit trail current
        })
        .eq("id", userId);

      if (error) {
        toast.error(`Update failed: ${error.message}`);
      } else {
        toast.success("Department saved!");
      }
    });
  }

  /* --------------------------- UI --------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="department">Department</Label>
      <Input
        id="department"
        placeholder="e.g., Department of Physics"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        limit={3}
      />
    </form>
  );
}
