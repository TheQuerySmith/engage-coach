import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import CourseList from "@/components/course-lists/fetch-courses";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <CourseList />
      <div className="text-center">
      <Link href="/courses/add-course">
        <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold no-underline cursor-pointer">
          + Add New Course
        </span>
      </Link>
      </div>
    </div>
  );
}
