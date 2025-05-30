import { createClient } from "@/utils/supabase/server";
import { TutorialStep } from "../TutorialStep";
import Link from "next/link";
import AddNotification from "@/components/ui/notification-ribbon";

// Define types.
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

type UserData = {
  survey1OpenDate: string | null;
  survey1CloseDate: string | null;
};

// Accept search parameters to get the showAllTasks flag.
interface TaskStatusProps {
  searchParams?: { showAllTasks?: string };
}

export default async function TaskStatus({ searchParams }: TaskStatusProps) {
  const supabase = await createClient();

  // Fetch user task status.
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

  // For header dates, pull earliest open date and latest close date per survey.
  const { data: s1OpenData } = await supabase
    .from("course_survey_windows")
    .select("open_at")
    .eq("survey_n", 1)
    .order("open_at", { ascending: true })
    .limit(1)
    .single();

  const { data: s1CloseData } = await supabase
    .from("course_survey_windows")
    .select("close_at")
    .eq("survey_n", 1)
    .order("close_at", { ascending: false })
    .limit(1)
    .single();

  const { data: s2OpenData } = await supabase
    .from("course_survey_windows")
    .select("open_at")
    .eq("survey_n", 2)
    .order("open_at", { ascending: true })
    .limit(1)
    .single();

  const { data: s2CloseData } = await supabase
    .from("course_survey_windows")
    .select("close_at")
    .eq("survey_n", 2)
    .order("close_at", { ascending: false })
    .limit(1)
    .single();

  // Format dates if available.
  const formatDate = (d: any) => (d ? new Date(d).toLocaleDateString() : "N/A");

  const survey1Header = `Survey 1: Opened from ${formatDate(s1OpenData?.open_at)} to ${formatDate(s1CloseData?.close_at)}`;
  const survey2Header = `Survey 2: Opened from ${formatDate(s2OpenData?.open_at)} to ${formatDate(s2CloseData?.close_at)}`;

  const userData: UserData = {
    survey1OpenDate: s1OpenData?.open_at || null,
    survey1CloseDate: s1CloseData?.close_at || null,
    survey2OpenDate: s2OpenData?.open_at || null,
    survey2CloseDate: s2CloseData?.close_at || null,
  };

  const now = new Date();

  // Determine if we show all tasks.
  const showAllTasks = searchParams?.showAllTasks === "true";

  // Helper: render a TutorialStep only if not completed (or if showAllTasks is true).
  const renderStep = (step: JSX.Element, completed: boolean, displayCondition: boolean = true) => {
    return (!completed || showAllTasks) && displayCondition ? step : null;
  };

  return (
    <div className="flex flex-col gap-6">
      <AddNotification
        message="Welcome to your dashboard! You can now start setting up your surveys by following the steps below"
        type="info"
      />
      <h2 className="font-bold text-2xl">Set up Your Course Surveys</h2>

      {/* Global / Setup Tasks */}
      {renderStep(
        <TutorialStep
          title="Update your user profile"
          stepType="setup"
          time="3 min"
          checked={status.profile_done}
        >
          <p>
            Visit your{" "}
            <Link href="/profile/update" className="font-bold hover:underline text-foreground/80">
              Profile Update Page
            </Link>{" "}
            to update your profile. Only your profile name and department will be visible to other
              users. After you update your profile, this item will be marked as complete.
          </p>
        </TutorialStep>,
        status.profile_done
      )}

      {renderStep(
        <TutorialStep
          title="Set up your course"
          stepType="setup"
          time="2 min per course"
          checked={status.course_created}
        >
          <p>
            Head over to the{" "}
            <Link href="/courses" className="font-bold hover:underline text-foreground/80">
              Courses &amp; Surveys Page
            </Link>{" "}
            to set up your course. If you have multiple courses, set them up one at a time. 
            Once you set up at least one course, this item will be marked as complete.
          </p>
        </TutorialStep>,
        status.course_created
      )}

      {renderStep(
        <TutorialStep title="Answer research consent" stepType="setup" checked={status.consent_done}>
          <p>Provide your research consent in your profile settings to proceed.</p>
        </TutorialStep>,
        status.consent_done, status.course_created // Show only if courses set up
      )}

      {status.profile_done && status.course_created && status.consent_done &&
        renderStep(
          <>
            <p>
              👍 You're all set up! You can always update your courses and scheduled surveys on the{" "}
              <Link href="/courses" className="font-bold hover:underline text-foreground/80">
              Courses &amp; Surveys Page
              </Link>
            </p>
          </>,
          false // This step is always shown when the condition is met
        )}

      {/* Survey 1 Tasks */}
      <h2 className="font-bold text-2xl">{survey1Header}</h2>

      {renderStep(
        <TutorialStep
          title="Complete Instructor Survey for Survey 1"
          stepType="surveys"
          checked={status.survey1_instructor_done}
        >
          <p>Your instructor surveys are now open! Head over to the{" "}
            <Link href="/courses" className="font-bold hover:underline text-foreground/80">
              Courses &amp; Surveys Page
            </Link>{" "}
            to complete the instructor survey for Survey 1 when available.
          </p>
        </TutorialStep>,
        status.survey1_instructor_done
      )}

      {renderStep(
        <TutorialStep
          title="Collect Student Responses for Survey 1"
          stepType="surveys"
          checked={status.survey1_students_done}
        >
          <p>
            Your student surveys are now open! Head over to the{" "}
            <Link href="/courses" className="font-bold hover:underline text-foreground/80">
              Courses &amp; Surveys Page
            </Link>{" "}
            to find survey links for each course. 
            Once at least 12 students have completed surveys, this item will be marked as complete.
          </p>
        </TutorialStep>,
        status.survey1_students_done
      )}


      {status.survey1_students_done && status.survey1_instructor_done && !status.survey1_report_done && // Surveys completed, report not yet generated
        renderStep(
          <>
            <p>
              👍 Survey reports are on the way! You will receive an email when they are ready!
            </p>
          </>,
           false // When no reports available
        )}

      {status.survey1_report_done && // Surveys completed, report generated
        renderStep(
          <TutorialStep
          title="Join Survey 1 Discussion"
          stepType="surveys"
          checked={status.survey1_discussion_signed || status.survey1_discussion_optout}
        >
          <p>Sign up to discuss your student reports with colleagues and facilitators. 
            You can also opt out if you would prefer not to take part in these discussions.</p>
        </TutorialStep>,
          status.survey1_discussion_signed || status.survey1_discussion_optout 
        )}

    {status.survey1_instructor_done && status.survey1_students_done && status.survey1_report_done &&
        renderStep(
          <>
            <p>
              👍 You now have reports available at {" "}
              <Link href="/courses" className="font-bold hover:underline text-foreground/80">
              Courses &amp; Surveys Page
              </Link>
            </p>
          </>,
          false // This step is always shown when the condition is met
        )}


      {/* Survey 2 Tasks (only if now is after Survey 1 close date) */}
        <>
          <h2 className="font-bold text-2xl">{survey2Header}</h2>

          {renderStep(
            <TutorialStep
              title="Complete Instructor Survey for Survey 2"
              stepType="surveys"
              checked={status.survey2_instructor_done}
            >
              <p>Complete the instructor survey for Survey 2 when available.</p>
            </TutorialStep>,
            status.survey2_instructor_done
          )}

          {renderStep(
            <TutorialStep
              title="Collect Student Responses for Survey 2"
              stepType="surveys"
              checked={status.survey2_students_done}
            >
              <p>Ensure that the minimum required number of students complete Survey 2.</p>
            </TutorialStep>,
            status.survey2_students_done
          )}

          {renderStep(
            <TutorialStep
              title="Generate Survey 2 Report"
              stepType="surveys"
              checked={status.survey2_report_done}
            >
              <p>A report for Survey 2 is generated after data collection is complete.</p>
            </TutorialStep>,
            status.survey2_report_done
          )}

          {renderStep(
            <TutorialStep
              title="Join Survey 2 Discussion"
              stepType="surveys"
              checked={status.survey2_discussion_signed || status.survey2_discussion_optout}
            >
              <p>
                Indicate whether you wish to participate in the Survey 2 discussion by signing up or opting out.
              </p>
            </TutorialStep>,
            status.survey2_discussion_signed || status.survey2_discussion_optout
          )}
        </>

      {/* Course-Wide Uploads */}
      <h2 className="font-bold text-2xl">Course Uploads</h2>

      {renderStep(
        <TutorialStep title="Upload Grades" stepType="optional" checked={status.grades_ok}>
          <p>Upload course grades to ensure your report data is accurate.</p>
        </TutorialStep>,
        status.grades_ok
      )}

      {renderStep(
        <TutorialStep title="Upload Course Recordings" stepType="optional" checked={status.recordings_ok}>
          <p>Upload the required course recording files so that your students can review course material.</p>
        </TutorialStep>,
        status.recordings_ok
      )}

      {/* Show All Tasks Button: link back to same page with showAllTasks=true */}
      <div className="pt-6">
        <Link
          href={`?showAllTasks=${!showAllTasks ? "true" : "false"}`}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded inline-block"
        >
          {showAllTasks ? "Hide Completed Tasks" : "Show All Tasks"}
        </Link>
      </div>
    </div>
  );
}