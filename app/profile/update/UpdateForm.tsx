// app/profile/update/UpdateForm.tsx
"use client";

import { useState, useTransition, useEffect, useRef, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";

interface Props {
  userId: string;
  initialDepartment: string | null;
}

export default function UpdateForm({ userId, initialDepartment }: Props) {
  const [dept, setDept] = useState(initialDepartment ?? "");
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  const originalDeptRef = useRef(initialDepartment ?? "");
  const isFirstRun = useRef(true);
  const debounceRef = useRef<number | undefined>(undefined);

  async function saveDept(value = dept) {
    const clean = value.trim();

    if (!clean) {
      toast.error("Department can’t be empty");
      return;
    }
    // if the value is the same as the last saved value, exit
    if (clean === originalDeptRef.current) {
      return;
    }

    startTransition(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          department: clean,
          user_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        toast.error(`Update failed: ${error.message}`);
      } else {
        originalDeptRef.current = clean; 
        toast.success("Department saved!");
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveDept();
  }

  // delay the saveDept function if currently updating
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      saveDept();
    }, 1000);
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
      <ToastContainer position="bottom-right" autoClose={1500} limit={3} />
    </form>
  );
}
