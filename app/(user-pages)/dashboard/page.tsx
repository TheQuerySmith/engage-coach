import { createClient } from "@/utils/supabase/server";
import { TutorialStep } from "./TutorialStep";
import Link from "next/link";
import AddNotification from "@/components/ui/notification-ribbon";
import React from 'react';

// Define types.
type TaskStatusRow = {
  profile_done: boolean;
  course_created: boolean;
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
  survey2OpenDate: string | null;
  survey2CloseDate: string | null;
};

// Accept search parameters to get the showAllTasks flag.
interface TaskStatusProps {
  searchParams?: Promise<{ showAllTasks?: string }>;
}

export default async function TaskStatus(props: TaskStatusProps) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Fetch user task status.
  const { data, error } = await supabase
    .from("user_task_status")
    .select(`
       profile_done,
       course_created,
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

  const survey1Header = `Survey 1: Open from ${formatDate(s1OpenData?.open_at)} to ${formatDate(s1CloseData?.close_at)}`;
  const survey2Header = `Survey 2: Open from ${formatDate(s2OpenData?.open_at)} to ${formatDate(s2CloseData?.close_at)}`;

  // Set userData based on the retrieved dates.
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
  const renderStep = (step: React.JSX.Element, completed: boolean, displayCondition: boolean = true) => {
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

      {status.course_created && (
        [1, 2].map((surveyNum) => {
        // Determine survey open date for the current survey.
        const surveyOpenDateKey = `survey${surveyNum}OpenDate` as keyof UserData;
        const surveyOpenDate = userData[surveyOpenDateKey] ? new Date(userData[surveyOpenDateKey]!) : null;
        const header = surveyNum === 1 ? survey1Header : survey2Header;

        if ((!surveyOpenDate || now < surveyOpenDate) && !showAllTasks && status.course_created) {
          return (
            <div key={surveyNum}>
              <h2 className="font-bold text-2xl">{header}</h2>
              {renderStep(
                <p className="mt-4">
                  ⏰ Check back on{" "}
                  {surveyOpenDate ? surveyOpenDate.toLocaleDateString() : "the scheduled date"} to complete survey {surveyNum}. You can find student survey links and change survey dates on the{" "}
                  <Link href="/courses" className="font-bold hover:underline text-foreground/80">
                    Courses & Surveys Page
                  </Link>.
                </p>,
                false // This step is always shown when the condition is met
              )}
            </div>
          );
        }


        if (!surveyOpenDate || now < surveyOpenDate && !showAllTasks) {
          return (
            <div key={surveyNum}>
              <h2 className="font-bold text-2xl">{header}</h2>
              {renderStep(
                <p className="mt-4">
                  ⏰ Check back on{" "}
                  {surveyOpenDate ? surveyOpenDate.toLocaleDateString() : "the scheduled date"} to complete survey {surveyNum}. You can find student survey links and change survey dates on the{" "}
                  <Link href="/courses" className="font-bold hover:underline text-foreground/80">
                    Courses & Surveys Page
                  </Link>.
                </p>,
                false // This step is always shown when the condition is met
              )}
            </div>
          );
        }
        return (
          <div key={surveyNum}>
            <h2 className="font-bold text-2xl">{header}</h2>
            
            {renderStep(
              <div className="my-4">
                <TutorialStep
                  title={`Complete Instructor Survey for Survey ${surveyNum}`}
                  stepType="surveys"
                  checked={(status as any)[`survey${surveyNum}_instructor_done`]}
                >
                  <p>
                    Complete the instructor survey for Survey {surveyNum} via the link on your Courses page.
                  </p>
                </TutorialStep></div>,
              (status as any)[`survey${surveyNum}_instructor_done`]
            )}
            
            {renderStep(
              <div className="my-4">
                <TutorialStep
                  title={`Collect Student Responses for Survey ${surveyNum}`}
                  stepType="surveys"
                  checked={(status as any)[`survey${surveyNum}_students_done`]}
                >
                  <p>
                    Your student surveys are now open! Head over to the{" "}
                    <Link href="/courses" className="font-bold hover:underline text-foreground/80">
                      Courses &amp; Surveys Page
                    </Link>{" "}
                    to find survey links for each course. Once at least 12 students in a course have completed surveys, this item will be marked as complete.
                  </p>
                </TutorialStep>
              </div>,
              (status as any)[`survey${surveyNum}_students_done`]
            )}
            
            {renderStep(
              <div className="my-4">
                <TutorialStep
                  title={`Generate Survey ${surveyNum} Report`}
                  stepType="surveys"
                  checked={(status as any)[`survey${surveyNum}_report_done`]}
                >
                  <p>
                    A report for Survey {surveyNum} is generated once survey data is complete. Check the Reports page for details.
                  </p>
                </TutorialStep>
              </div>,
              (status as any)[`survey${surveyNum}_report_done`],
              (status as any)[`survey${surveyNum}_instructor_done`] && (status as any)[`survey${surveyNum}_students_done`]
            )}
            
            {renderStep(
              <div className="my-4">
                <TutorialStep
                title={`Join Survey ${surveyNum} Discussion`}
                stepType="surveys"
                checked={(status as any)[`survey${surveyNum}_discussion_signed`] || (status as any)[`survey${surveyNum}_discussion_optout`]}
                >
                  <p>
                    Indicate your discussion preference for Survey {surveyNum}—either sign up or opt out.
                  </p>
                </TutorialStep>
              </div>,
              (status as any)[`survey${surveyNum}_discussion_signed`] || (status as any)[`survey${surveyNum}_discussion_optout`]
            )}

          </div>
        );
      }))}

      {/* Course-Wide Uploads 
      <h2 className="font-bold text-2xl">Course Uploads</h2>

      {renderStep(
        <TutorialStep title="Upload Grades" stepType="optional" checked={status.grades_ok}>
          <p>Upload course grades to provide greater insights into what is working for your students.</p>
        </TutorialStep>,
        status.grades_ok,
        userData.survey2CloseDate && now > new Date(userData.survey2CloseDate)
      )}

      {renderStep(
        <TutorialStep title="Upload Course Recordings" stepType="optional" checked={status.recordings_ok}>
          <p>Upload the required course recording files to learn more about what students' are noticing.</p>
        </TutorialStep>,
        status.recordings_ok
      )}
        */}

      {/* Show All Tasks Button: link back to same page with showAllTasks=true */}
      <div className="pt-6">
        <Link
          href={`?showAllTasks=${!showAllTasks ? "true" : "false"}`}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded inline-block"
        >
          {showAllTasks ? "Hide All Tasks" : "Show All Tasks"}
        </Link>
      </div>
    </div>
  );
}