// app/profile/update/DepartmentForm.tsx
"use client";

import { createBrowserClient } from "@/utils/supabase/client";
import { ToastContainer, toast } from 'react-toastify';
import { Button } from "@/components/ui/button";

export default function App() {
  const notify = () => toast.success('Wow so easy !');

  return (
    <div className="grid place-items-center h-dvh bg-zinc-900/15">
      <Button onClick={notify}>Notify !</Button>
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        limit={3}
      />
    </div>
  );
}