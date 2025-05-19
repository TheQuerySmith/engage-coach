'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface DeleteCourseProps {
  courseId: string;
}

export default function DeleteCourse({ courseId }: DeleteCourseProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course? All corresponding course and student data will be deleted. This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("courses").delete().eq("id", courseId);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/courses");
    }
  };

  return (
    <div>
      {error && <p className="text-red-600">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        {loading ? "Deleting..." : "Delete Course"}
      </button>
    </div>
  );
}