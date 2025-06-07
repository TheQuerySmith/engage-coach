import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import SurveyList from "./FetchSurveys";

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
      <SurveyList />
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
