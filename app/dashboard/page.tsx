import FetchNextSteps from "./FetchNextSteps";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddNotification from "@/components/ui/notification-ribbon";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch the current user.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch profile details.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch checklist entries for the user.
  const { data: entries } = await supabase
    .from("user_checklist")
    .select("completed, checklist_items(name)")
    .eq("user_id", user.id);

  // Fetch the earliest Survey 1 open_at date.
  const { data: survey1WindowData } = await supabase
    .from("course_survey_windows")
    .select("open_at")
    .eq("survey_n", 1)
    .order("open_at", { ascending: true })
    .limit(1)
    .single();

  // Fetch the earliest Survey 2 open_at date.
  const { data: survey2WindowData } = await supabase
    .from("course_survey_windows")
    .select("open_at")
    .eq("survey_n", 2)
    .order("open_at", { ascending: true })
    .limit(1)
    .single();

  // Prepare all data to send as props to the client component.
  const userData = {
    id: user.id,
    email: user.email,
    profile,
    checklistEntries: entries,
    survey1OpenDate: survey1WindowData?.open_at || null,
    survey2OpenDate: survey2WindowData?.open_at || null,
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div>
        <AddNotification
          message="Welcome to your dashboard! You can now start setting up your surveys by following the steps below"
          type="info"
        />
        <FetchNextSteps userData={userData} />
      </div>
    </div>
  );
}