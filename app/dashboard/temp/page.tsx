import { createClient } from "@/utils/supabase/server";
import { TutorialStep } from "../TutorialStep";
import Link from "next/link";
import AddNotification from "@/components/ui/notification-ribbon";


type TaskStatusRow = {
  profile_done: boolean;
  course_created: boolean;
  dates_confirmed: boolean;
  consent_done: boolean;
  survey1_instructor_done: boolean;
  survey1_students_done: boolean;
  survey1_report_done: boolean;
  survey1_discussion_signed: boolean;
  survey1_discussion_optout: boolean;
  survey2_instructor_done: boolean;
  survey2_students_done: boolean;
  survey2_report_done: boolean;
  survey2_discussion_signed: boolean;
  survey2_discussion_optout: boolean;
  grades_ok: boolean;
  recordings_ok: boolean;
};

export default async function TaskStatus() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_task_status")
    .select(`
       profile_done,
       course_created,
       dates_confirmed,
       consent_done,
       survey1_instructor_done,
       survey1_students_done,
       survey1_report_done,
       survey1_discussion_signed,
       survey1_discussion_optout,
       survey2_instructor_done,
       survey2_students_done,
       survey2_report_done,
       survey2_discussion_signed,
       survey2_discussion_optout,
       grades_ok,
       recordings_ok
    `)
    .single();

  if (error || !data) {
    return (
      <p className="text-red-600">
        {error?.message || "No status found."}
      </p>
    );
  }
  
  const status = data as TaskStatusRow;
  
  return (
    <div className="flex flex-col gap-6">
      <AddNotification
          message="Welcome to your dashboard! You can now start setting up your surveys by following the steps below"
          type="info"
        />
      <h2 className="font-bold text-2xl">Set up Your Course Surveys</h2>

      {/* Global / Setup Tasks */}
      <TutorialStep
        title="Update your user profile"
        stepType="setup"
        time="3 min"
        checked={status.profile_done}
      >
        <p>
          Visit your{" "}
          <Link
            href="/profile/update"
            className="font-bold hover:underline text-foreground/80"
          >
            Profile Update Page
          </Link>{" "}
          to complete your profile details. This step is marked as complete when your profile is updated.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Set up your course"
        stepType="setup"
        time="2 min per course"
        checked={status.course_created}
      >
        <p>
          Head over to the{" "}
          <Link
            href="/courses"
            className="font-bold hover:underline text-foreground/80"
          >
            Courses &amp; Surveys Page
          </Link>{" "}
          to create and manage your courses.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Confirm survey dates"
        stepType="setup"
        checked={status.dates_confirmed}
      >
        <p>
          Confirm your survey dates on your course page so that the surveys schedule correctly.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Answer research consent"
        stepType="setup"
        checked={status.consent_done}
      >
        <p>
          Provide your research consent in your profile settings to proceed.
        </p>
      </TutorialStep>

      {/* Survey 1 Tasks */}
      <h2 className="font-bold text-2xl">Survey 1</h2>

      <TutorialStep
        title="Complete Instructor Survey for Survey 1"
        stepType="surveys"
        checked={status.survey1_instructor_done}
      >
        <p>
          Complete the instructor survey for Survey 1 via the link on your Courses page.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Collect Student Responses for Survey 1"
        stepType="surveys"
        checked={status.survey1_students_done}
      >
        <p>
          Ensure the minimum required student responses are recorded for Survey 1. This threshold is automatically met once enough responses are received.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Generate Survey 1 Report"
        stepType="surveys"
        checked={status.survey1_report_done}
      >
        <p>
          A report for Survey 1 is generated once survey data is complete. Check the Reports page for details.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Join Survey 1 Discussion"
        stepType="surveys"
        checked={
          status.survey1_discussion_signed || status.survey1_discussion_optout
        }
      >
        <p>
          Indicate your discussion preference for Survey 1—either sign up for the discussion or opt out.
        </p>
      </TutorialStep>

      {/* Survey 2 Tasks */}
      <h2 className="font-bold text-2xl">Survey 2</h2>

      <TutorialStep
        title="Complete Instructor Survey for Survey 2"
        stepType="surveys"
        checked={status.survey2_instructor_done}
      >
        <p>
          Complete the instructor survey for Survey 2 when available.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Collect Student Responses for Survey 2"
        stepType="surveys"
        checked={status.survey2_students_done}
      >
        <p>
          Ensure that the minimum required number of students complete Survey 2.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Generate Survey 2 Report"
        stepType="surveys"
        checked={status.survey2_report_done}
      >
        <p>
          A report for Survey 2 will be generated after data collection is complete.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Join Survey 2 Discussion"
        stepType="surveys"
        checked={
          status.survey2_discussion_signed || status.survey2_discussion_optout
        }
      >
        <p>
          Indicate whether you wish to participate in the Survey 2 discussion by signing up or opting out.
        </p>
      </TutorialStep>

      {/* Course-Wide Uploads */}
      <h2 className="font-bold text-2xl">Course Uploads</h2>

      <TutorialStep
        title="Upload Grades"
        stepType="optional"
        checked={status.grades_ok}
      >
        <p>
          Upload course grades to ensure your report data is accurate.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Upload Course Recordings"
        stepType="optional"
        checked={status.recordings_ok}
      >
        <p>
          Upload the required course recording files so that your students can review course material.
        </p>
      </TutorialStep>
    </div>
  );
}