'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SurveyPage() {
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkSurveyCompletion = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }

      // Check if the user's ID is in the "qualtrics_instructor_responses" table
      const { data, error } = await supabase
        .from('qualtrics_instructor_responses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking survey completion:', error);
      } else if (data) {
        setSurveyCompleted(true); // Mark survey as completed
      }
    };

    // Poll the database every 5 seconds
    const interval = setInterval(() => {
      checkSurveyCompletion();
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [supabase]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <iframe
        src="https://utexas.qualtrics.com/jfe/form/SV_b7PqMufNgIi0Jjo"
        title="Qualtrics Survey"
        className="w-screen h-screen border-none"
        allowFullScreen
      ></iframe>
    </div>
  );
}