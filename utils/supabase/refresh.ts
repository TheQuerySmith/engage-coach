'use client';

import { createClient } from '@/utils/supabase/client';

interface PollParams {
  surveyRecordId: string;
  surveyN: number;
  instructorId: string;
  intervalMs?: number;
}

export async function pollForSurveyCompletion({
  surveyRecordId,
  surveyN,
  instructorId,
  intervalMs = 5000,
}: PollParams) {
  const supabase = createClient();

  const checkCompletion = async () => {
    const { data, error } = await supabase
      .from('instructor_survey_responses')
      .select('instructor_id')
      .eq('instructor_id', instructorId)
      .eq('survey_id', surveyRecordId)
      .eq('survey_n', surveyN);
    if (error) {
      console.error('Error checking survey completion:', error);
      return false;
    }
    return data && data.length > 0;
  };

  const intervalId = setInterval(async () => {
    const completed = await checkCompletion();
    if (completed) {
      clearInterval(intervalId);
      window.location.reload();
    }
  }, intervalMs);
}