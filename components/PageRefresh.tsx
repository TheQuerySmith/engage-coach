'use client';

import { useEffect } from 'react';
import { pollForSurveyCompletion } from '@/utils/supabase/refresh';

export default function PageWithPoll({
  surveyRecordId,
  surveyN,
  instructorId,
}: {
  surveyRecordId: string;
  surveyN: number;
  instructorId: string;
}) {
  useEffect(() => {
    pollForSurveyCompletion({
      surveyRecordId,
      surveyN,
      instructorId,
      intervalMs: 5000,
    });
  }, [surveyRecordId, surveyN, instructorId]);

  return null;
}