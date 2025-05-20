'use client';
import { createClient } from "@/utils/supabase/client"; // make sure you're using the client helper here
import { TutorialStep } from "./tutorial-step";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


// Accept props from the server component
interface FetchNextStepsProps {
  userData: {
    id: string;
    email: string;
    profile?: any;
  };
}

export default function FetchNextSteps({ userData }: FetchNextStepsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [completedMap, setCompletedMap] = useState<Map<string, boolean>>(new Map());
  const [survey1OpenDate, setSurvey1OpenDate] = useState<Date | null>(null);
  const [survey2OpenDate, setSurvey2OpenDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Get the current user details; if missing, redirect.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Fetch checklist entries for the user.
      const { data: entries, error: checklistError } = await supabase
        .from("user_checklist")
        .select("completed, checklist_items(name)")
        .eq("user_id", user.id);
      if (checklistError) {
        console.error(checklistError);
        setFetchError("Failed to load your checklist.");
        setLoading(false);
        return;
      }
      const compMap: Map<string, boolean> = new Map(
        entries.map((e: any) => [e.checklist_items.name, e.completed])
      );
      setCompletedMap(compMap);

      // Query the earliest Survey 1 open_at date.
      const { data: survey1WindowData, error: survey1WindowError } = await supabase
        .from("course_survey_windows")
        .select("open_at")
        .eq("survey_n", 1)
        .order("open_at", { ascending: true })
        .limit(1)
        .single();
      if (!survey1WindowError && survey1WindowData && survey1WindowData.open_at) {
        setSurvey1OpenDate(new Date(survey1WindowData.open_at));
      }

      // Query the earliest Survey 2 open_at date.
      const { data: survey2WindowData, error: survey2WindowError } = await supabase
        .from("course_survey_windows")
        .select("open_at")
        .eq("survey_n", 2)
        .order("open_at", { ascending: true })
        .limit(1)
        .single();
      if (!survey2WindowError && survey2WindowData && survey2WindowData.open_at) {
        setSurvey2OpenDate(new Date(survey2WindowData.open_at));
      }

      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  useEffect(() => {
    console.log(`Show completed steps: ${showCompleted}`);
  }, [showCompleted]);

  if (loading) return <p>Loading...</p>;
  if (fetchError) return <p className="text-center text-red-600 p-6">{fetchError}</p>;

  const now = new Date();
  // display the complete Survey 1 steps if survey1OpenDate is today or in the past
  const displayCompleteSurveySection = survey1OpenDate && now >= survey1OpenDate;
  

  // Display logic
  // SET-UP STEPS
  // If the user has missing set-up steps, show those.
    // If the user has completed all set-up steps, but it is before the first survey date, show "come back later"
      // If the user has completed all set-up steps and it is after the first survey date, show nothing (null)
  // SURVEY 1 STEPS
  // If it is before the first survey date, show nothing
    // If is after the first survey date, show the complete survey steps.
      // If the user has completed all survey steps but doesn't have a report, show "come back in one week for report

  // SURVEY 1 REPORT
  // If the user has a report, show steps
  // If the user has completed all report steps show "come back later for survey 2"

    // SURVEY 2 STEPS
  // If it is before the first survey date, show nothing
    // If is after the first survey date, show the complete survey steps.
      // If the user has completed all survey steps but doesn't have a report, show "come back in one week for report

  // SURVEY 2 REPORT
  // If the user has a report, show steps

  // RESOURCES
  // If the user has completed all resources steps, show "thanks for being a part of the community! And refer to community page"

  return (
    <div className="flex flex-col gap-6">
      {/* SET-UP STEPS  */}
        {(!showCompleted &&
         (!completedMap.get("updated_user_profile") || !completedMap.get("setup_course"))) ||
         showCompleted ? (
          <>
          <h2 className="font-bold text-2xl">Set up your Courses</h2>
          <TutorialStep title="Update your user profile" stepType="setup" time="3 min" checked={completedMap.get("updated_user_profile") ?? false}>
            <p>
              Head over to the{" "}
              <a
                href="./profile/update"
                className="font-bold hover:underline text-foreground/80"
                target="_blank"
                rel="noreferrer"
              >
                Profile Update Page
              </a>{" "}
              to update your profile. Only your profile name and department will be visible
              to other users. Everything else is private and only visible to our team. After
              you update your profile, this item will be marked as complete.
            </p>
          </TutorialStep>

          <TutorialStep title="Set up your course" type="setup" time = "2 min (per course)" checked={completedMap.get("setup_course") ?? false}>
            <p>
              Head over to the{" "}
              <a
                href="./courses"
                className="font-bold hover:underline text-foreground/80"
                target="_blank"
                rel="noreferrer"
              >
                Courses and Surveys Page
              </a>{" "}
              to set up your course. If you have multiple courses, you can set them up one at a time. After you set up at least one course, this item will be marked as
              complete. 
            </p>
          </TutorialStep>
        </>
          
        ) : (
          // If the user has completed all set-up steps, but it is before the first survey date, show "come back later"
          now < survey1OpenDate ? (
            <>
              <h2 className="font-bold text-2xl">Set up your Courses</h2>
              <p>
                Your surveys are all set up! Come back here on{" "}
                {survey1OpenDate ? survey1OpenDate.toLocaleDateString() : "the scheduled date"} to complete the instructor survey or change your survey dates if your timing has changed. You can find unique survey links to send to students in each course on your{" "}
                <a href="/courses" className="font-bold hover:underline">
                  Courses and Surveys Page
                </a>. In the meantime, check out the resources below!
              </p>
            </>
          ) : 
          // If the user has completed all set-up steps and it is after the first survey date, show nothing (null)
          null
        )}
        
        {displayCompleteSurveySection ? (
          <>
            <h2 className="font-bold text-2xl">Survey 1</h2>
            <p>
                Your student surveys are now open! Head over to the{" "}
                <a href="/courses" className="font-bold hover:underline">
                Courses and Surveys
              </a> page to find survey links for each course. 
              </p>
            <TutorialStep 
              title="Send out student surveys" 
              type="surveys" 
              checked={completedMap.get("student_surveys") ?? false}
            >
              <p>Once at least 12 students in active courses have completed the survey, this item will be marked as complete, or you can mark it complete yourself.</p>
              
            </TutorialStep>

            <TutorialStep 
              title="Complete instructor surveys" 
              type="surveys" 
              checked={completedMap.get("instructor_surveys") ?? false}
            >
              <p>
                Once you have complete surveys for all active courses, this item will be marked as complete.
              </p>
            </TutorialStep>
          </>
        ) : null}

        <h2 className="font-bold text-2xl">Check out the community and resources</h2>

        <TutorialStep title="Introduce yourself to the community" stepType="resources" checked={completedMap.get("posted_community") ?? false} >
          <p>
            Head over to the{" "}
            <a
              href="./community"
              className="font-bold hover:underline text-foreground/80"
              target="_blank"
              rel="noreferrer"
            >
              Community Page
            </a>{" "}
            to share an instructional win or learn what others are doing. After you post,
            like, or comment, this item will be marked as complete.
          </p>
        </TutorialStep>

        <TutorialStep title="Receive a free book!" stepType="resources" checked={completedMap.get("completed_book_signup") ?? false}>
          <p>
            Please indicate if you are interested in getting a free copy of Dr. David Yeager's book <em>10 to 25: 
            The Science of Motivating Young People</em>, by filling out the {" "}
            <a
              href="./resources/10-to-25"
              className="font-bold hover:underline text-foreground/80"
              target="_blank"
              rel="noreferrer"
            >
              Book Request Form
            </a>
            , or indicate you do not want to receive a book.
          </p>
        </TutorialStep>

        <TutorialStep title="Check our our library of resources" stepType="resources" checked={completedMap.get("clicked_library") ?? false}>
          <p>
            Some words here.
          </p>
        </TutorialStep>
      <button
        onClick={() => setShowCompleted((prev) => !prev)}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded mt-6 self-center"
      >
        {showCompleted ? "Hide completed steps" : "Show completed steps"}
      </button>
    </div>
  );
}
