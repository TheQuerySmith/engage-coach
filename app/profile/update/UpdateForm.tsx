// app/profile/update/UpdateForm.tsx
"use client";

import { useState, useTransition, useEffect, useRef, FormEvent } from "react";
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

  const originalDeptRef = useRef(initialDepartment ?? "");
  const isFirstRun = useRef(true);
  const debounceRef = useRef<number | undefined>(undefined);

  // central save function
  async function saveDept(value = dept) {
    const clean = value.trim();
    if (!clean) {
      toast.error("Department can’t be empty");
      return;
    }
    if (clean === originalDeptRef.current) {
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
        // update our “last saved” ref so future calls bail out if no change
        originalDeptRef.current = clean;
      }
    });
  }

  /* --------------------------- UI --------------------------- */
  // on form submit (keep if you still want a button)
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveDept();
  }

  // debounce on typing stop
  // debounce on typing
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      saveDept();
    }, 1000);

    // clean up on unmount or next keystroke
    return () => clearTimeout(debounceRef.current);
  }, [dept]);

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="department">Department</Label>
      <Input
        id="department"
        placeholder="e.g., Department of Physics"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
        onBlur={() => {
          clearTimeout(debounceRef.current);
          saveDept();
        }}
      />
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        limit={3}
      />
    </form>
  );
}
