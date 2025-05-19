import FetchNextSteps from "@/components/task-lists/fetch-next-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import AddNotification from "@/components/ui/notification-ribbon";

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
      <div>
        <AddNotification message="Welcome to your dashboard! You can now start setting 
        up your surveys by following the steps below" type="info" />
        <FetchNextSteps />
      </div>
    </div>
  );
}
