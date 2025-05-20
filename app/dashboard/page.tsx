import FetchNextSteps from "@/components/task-lists/fetch-next-steps";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddNotification from "@/components/ui/notification-ribbon";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user } 
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Optionally, fetch additional profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Prepare data to send as props to interactive client components
  const userData = {
    id: user.id,
    email: user.email,
    profile,
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