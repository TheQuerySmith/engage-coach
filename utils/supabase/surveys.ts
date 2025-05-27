import { createClient } from '@/utils/supabase/server';

export interface getSurveyLinkParams {
  surveyName: string;
  surveyN: number;
  instructorId?: string;
  courseId?: string; // Optional for instructor surveys
}

export async function getSurveyLink({
  surveyName,
  surveyN,
  instructorId,
  courseId,
}: getSurveyLinkParams): Promise<string> {
  const supabase = await createClient();

  // Fetch the survey record
  const { data: surveyData, error: surveyError } = await supabase
    .from('surveys')
    .select('id, link')
    .eq('name', surveyName)
    .single();

  if (surveyError || !surveyData) {
    throw new Error(`Error fetching survey: ${surveyError?.message}`);
  }

  let courseParam = '';
  if (courseId) {
    courseParam = `&course_id=${courseId}`;
  }

  const instructorParam = instructorId ? `instructor_id=${instructorId}&` : '';
  const constructedLink = `${surveyData.link}?${instructorParam}${courseParam}&survey_n=${surveyN}`;
  return constructedLink;
}