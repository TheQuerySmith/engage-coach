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
  // Await the client since createClient returns a promise.
  const supabase = await createClient();

  const { data: surveyData, error } = await supabase
    .from('surveys')
    .select('id, link')
    .eq('name', surveyName)
    .single();

  if (error || !surveyData) {
    throw new Error(`Error fetching survey: ${error?.message}`);
  }

  const instructorParam = instructorId ? `instructor_id=${instructorId}&` : '';
  const courseParam = courseId ? `&course_id=${courseId}` : '';
  const constructedLink = `${surveyData.link}?${instructorParam}survey_id=${surveyData.id}${courseParam}&survey_n=${surveyN}`;
  return constructedLink;
}