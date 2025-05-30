'use client';
import { TutorialStep } from "./TutorialStep";
import { useState, useMemo, useEffect } from "react";

// Accept props from the server component
interface FetchNextStepsProps {
  userData: {
    id: string;
    email: string;
    profile?: any;
    checklistEntries: any[]; // array of checklist entries
    survey1OpenDate: string | null; // ISO string or null
    survey2OpenDate: string | null; // ISO string or null
  };
}

export default function FetchNextSteps({ userData }: FetchNextStepsProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [dashboardProgress, setDashboardProgress] = useState(0);


  // Compute the completedMap from the checklist entries passed in userData.
  const completedMap = useMemo(() => {
    return new Map(
      userData.checklistEntries.map((e: any) => [e.checklist_items.name, e.completed])
    );
  }, [userData.checklistEntries]);

  // Convert survey open dates from ISO strings (if present) to Date objects.
  const survey1Date = userData.survey1OpenDate ? new Date(userData.survey1OpenDate) : null;
  const survey2Date = userData.survey2OpenDate ? new Date(userData.survey2OpenDate) : null;

  // For debugging: log showCompleted toggle changes.
  useEffect(() => {
    console.log(`Show completed steps: ${showCompleted}`);
  }, [showCompleted]);

  const now = new Date();
  

  // Display logic
  // SET-UP STEPS
  // (dashboardProgress === 0) If the user has missing set-up steps, show those.

  // SURVEY 1 STEPS
  // (dashboardProgress <= 1) If the user has set up surveys
    // (timeProgress === "beforeSurvey1" || null) ? Show "come back later for surveys" message.
    // (timeProgress === "duringSurvey1") ? Show survey steps
    // (timeProgress === "betweenSurveys") ? Show "come back later for reports" message.

// (dashboardProgress === 2) If the user has completed surveys
    // (timeProgress === "duringSurvey1") ? Still collecting responses
    // (timeProgress === "betweenSurveys" & !hasReport1) ? Show

  // If it is before the survey open date or no dates exist, 
  // 2 = If it is after the survey open date, show the complete survey steps.
  // 3 = If it is before the survey close date sh

  // SURVEY 1 REPORT
  // 4 = If the user has a report, show steps

  // SURVEY 2 STEPS
  // 5 = If the user has completed all report steps show "come back later for survey 2"
  

  // SURVEY 2 REPORT
  // If the user has a report, show steps

  // RESOURCES
  // If the user has completed all resources steps, show "thanks for being a part of the community! And refer to community page"
  // Display the complete Survey 1 steps if survey1Date is today or in the past.
  const displayCompleteSurveySection = survey1Date && now >= survey1Date;

  return (
    <div className="flex flex-col gap-6">
      {/* SET-UP STEPS */}
      {((!showCompleted && dashboardProgress === 0) ||showCompleted) ? (
        <>
          <h2 className="font-bold text-2xl">Set up your Courses</h2>
          <TutorialStep
            title="Update your user profile"
            stepType="setup"
            time="3 min"
            checked={completedMap.get("updated_user_profile") ?? false}
          >
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
              to update your profile. Only your profile name and department will be visible to other
              users. After you update your profile, this item will be marked as complete.
            </p>
          </TutorialStep>

          <TutorialStep
            title="Set up your course"
            stepType="setup"
            time="2 min (per course)"
            checked={completedMap.get("setup_course") ?? false}
          >
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
              to set up your course. If you have multiple courses, set them up one at a time. Once you set up at least one course, this item will be marked as complete.
            </p>
          </TutorialStep>
        </>
      ) : null
      /* (
        // If the user has completed all set-up steps but it is before the survey open date, show "come back later" message.
        now < (survey1Date as Date) ? (
          <>
            <h2 className="font-bold text-2xl">Set up your Courses</h2>
            <p>
              Your surveys are all set up! Come back here on{" "}
              {survey1Date ? survey1Date.toLocaleDateString() : "the scheduled date"} to complete the instructor survey or change your survey dates. You can find unique survey links on your{" "}
              <a href="/courses" className="font-bold hover:underline">
                Courses and Surveys Page
              </a>. In the meantime, check out the resources below!
            </p>
          </>
        ) : null
      ) */
      }

      {((!showCompleted && dashboardProgress <= 1) ||showCompleted) ? (
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
            stepType="surveys"
            checked={completedMap.get("student_surveys") ?? false}
          >
            <p>
              Once at least 12 students in active courses have completed the survey, this item will be marked as complete (or you can mark it complete yourself).
            </p>
          </TutorialStep>

          <TutorialStep
            title="Complete instructor surveys"
            stepType="surveys"
            checked={completedMap.get("instructor_surveys") ?? false}
          >
            <p>
              Once you have complete surveys for all active courses, this item will be marked as complete.
            </p>
          </TutorialStep>
        </>
      ) : null}

      <h2 className="font-bold text-2xl">Check out the community and resources</h2>
      <TutorialStep
        title="Introduce yourself to the community"
        stepType="resources"
        checked={completedMap.get("posted_community") ?? false}
      >
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
          to share an instructional win or learn what others are doing. After you post, like, or comment, this item will be marked as complete.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Receive a free book!"
        stepType="resources"
        checked={completedMap.get("completed_book_signup") ?? false}
      >
        <p>
          Please indicate if you're interested in getting a free copy of Dr. David Yeager's book <em>10 to 25: The Science of Motivating Young People</em> by filling out the{" "}
          <a
            href="./resources/10-to-25"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            Book Request Form
          </a>, or indicate you do not want to receive a book.
        </p>
      </TutorialStep>

      <TutorialStep
        title="Check out our library of resources"
        stepType="resources"
        checked={completedMap.get("clicked_library") ?? false}
      >
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
