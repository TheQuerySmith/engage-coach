import { createClient } from "@/utils/supabase/server";
import { TutorialStep } from "../TutorialStep";
import Link from "next/link";



type TaskStatusRow = {
  profile_done: boolean;
  course_created: boolean;
  dates_confirmed: boolean;
  consent_done: boolean;
  survey1_students_done: boolean;
};

export default async function TaskStatus() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_task_status")
    .select(
      `profile_done,
       course_created,
       dates_confirmed,
       consent_done,
       survey1_students_done`
    )
    .single();
  
  if (error || !data) {
    return <p className="text-red-600">{error?.message || "No status found."}</p>;
  }
  
  const status = data as TaskStatusRow;
  
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-2xl">Set up your Courses</h2>
      <TutorialStep
            title="Update your user profile"
            stepType="setup"
            time="3 min"
            checked={false}
          >
            <p>
            Head over to the{' '}
            <Link className="font-bold hover:underline text-foreground/80" href="/profile/update">
              Profile Update Page
            </Link>{' '}
            to update your profile. Only your profile name and department will be visible to other
            users. After you update your profile, this item will be marked as complete.
            </p>
      </TutorialStep>
      <TaskRow label="Profile updated" done={status.profile_done} />
      <TaskRow label="Course created" done={status.course_created} />
      <TaskRow label="Dates confirmed" done={status.dates_confirmed} />
      <TaskRow label="Research consent answered" done={status.consent_done} />
      <TaskRow label="Students completed" done={status.survey1_students_done} />
    </div>
  );
}

function TaskRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      <span
        className={
          "inline-block h-3 w-3 rounded-full " +
          (done ? "bg-green-500" : "bg-gray-400")
        }
      />
      <span>{label}</span>
    </div>
  );
}