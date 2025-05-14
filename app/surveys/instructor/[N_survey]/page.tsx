'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SurveyPage() {
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [uniqueLink, setUniqueLink] = useState<string | null>(null);
  const supabase = createClient();

  // Extract N_survey from the URL and convert to a number
  const params = useParams();
  const this_survey_n = Number(params.N_survey);
  const this_survey_name = 'Instructor Personal Survey 2025';

  useEffect(() => {
    // Function to construct the unique survey link
    const setupSurveyLink = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }

      // Query the surveys table for the given survey name
      const { data: surveyData, error } = await supabase
        .from('surveys')
        .select('id, link')
        .eq('name', this_survey_name)
        .single();

      if (error || !surveyData) {
        console.error('Error fetching survey:', error);
        return;
      }

      // Construct the unique survey link
      // Format: [surveys.link]?instructor_id=[user.id]&survey_id=[surveyData.id]&survey_n=[this_survey_n]
      const constructedLink = `${surveyData.link}?instructor_id=${user.id}&survey_id=${surveyData.id}&survey_n=${this_survey_n}`;
      setUniqueLink(constructedLink);
    };

    // Call the setup function on mount
    setupSurveyLink();

    // Function to check if the user completed the survey
    const checkSurveyCompletion = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }

      // Check if the user's ID is in the qualtrics_instructor_responses table
      const { data, error } = await supabase
        .from('qualtrics_instructor_responses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking survey completion:', error);
      } else if (data) {
        setSurveyCompleted(true);
      }
    };

    // Poll the survey completion status every 5 seconds
    const interval = setInterval(() => {
      checkSurveyCompletion();
    }, 5000);

    return () => clearInterval(interval);
  }, [supabase, this_survey_n, this_survey_name]);

  if (surveyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <h1 className="text-2xl font-bold text-green-700">Survey Completed!</h1>
        <p className="text-gray-700 mt-4">
          Thank you for completing the survey. You may now proceed to the next step.
        </p>
      </div>
    );
  }

  if (!uniqueLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p>Loading survey...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <iframe
        src={uniqueLink}
        title="Qualtrics Survey"
        className="w-screen h-screen border-none"
        allowFullScreen
      ></iframe>
    </div>
  );
}