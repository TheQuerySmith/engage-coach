// app/profile/update/UpdateForm.tsx
"use client";

import { useState, useTransition, useEffect, useRef, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";

interface UpdateProfileFieldProps {
  /** `auth.users.id` ( ← the FK stored in `profiles.id`) */
  userId: string;
  /** Column in `profiles` you want to update (e.g., "department", "office") */
  column: string;
  /** UI label for the input */
  label: string;
  /** Optional note for the input */
  note?: string;
  /** Starting value for this column */
  initialValue?: string | null;
  /** Optional placeholder text */
  placeholder?: string;
  /**
   * Optional validation.  
   * Return `null` if valid, or an error message string if invalid.
   * Defaults to “required”.
   */
  validate?: (value: string) => string | null;
}

export default function UpdateProfileField({
  userId,
  column,
  label,
  note,
  initialValue = "",
  placeholder,
  validate,
}: UpdateProfileFieldProps) {
  /* ───────────────────────────── state / refs ───────────────────────────── */
  const [value, setValue] = useState(initialValue ?? "");
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  const originalValueRef = useRef(initialValue ?? "");
  const isFirstRun = useRef(true);
  const debounceRef = useRef<number | undefined>(undefined);

  /* ───────────────────────────── helpers ───────────────────────────── */
  /** Simple required‐field validation unless custom one is supplied */
  const runValidation = (val: string) =>
    validate ? validate(val) : !val.trim() ? `${label} can’t be empty` : null;

  async function save(val = value) {
    const clean = val.trim();

    // 1. Validate
    const errorMsg = runValidation(clean);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    // 2. No‑op if unchanged
    if (clean === originalValueRef.current) return;

    startTransition(async () => {
      const updatePayload = {
        [column]: clean,
        user_edited: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId);

      if (error) {
        toast.error(`Update failed: ${error.message}`);
      } else {
        originalValueRef.current = clean;
        //toast.success(`${label} saved!`);
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save();
  }

  /* ───────────────────────────── auto‑save on change ───────────────────────────── */
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      save();
    }, 1_000);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // ← re‑run whenever the input changes

  /* ───────────────────────────── render ───────────────────────────── */
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Label htmlFor={column}>{label}</Label>
        {note && (
            <p className="text-xs text-blue-700 bg-blue-50 rounded px-1 py-0.5 border-l-2 border-blue-400 mb-1">
            {note}
            </p>
        )}
        <Input
          id={column}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            clearTimeout(debounceRef.current);
            save();
          }}
        />
      </form>
      <ToastContainer position="bottom-right" autoClose={1500} limit={3} />
    </>
  );
}
