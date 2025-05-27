import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSurveyLink } from '@/utils/supabase/surveys';

interface SurveyPageProps {
  params: {
    N_survey: string;
  };
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const supabase = await createClient();

  // Extract survey number from the URL parameters
  const this_survey_n = Number(params.N_survey);
  const this_survey_name = 'Instructor Baseline Survey 2025';

  // Fetch the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/sign-in');
  }

  // Get the survey link using the helper function.
  const uniqueLink = await getSurveyLink({
    surveyName: this_survey_name,
    surveyN: this_survey_n,
    instructorId: user.id,
  });

  // Check if the survey is already completed by the instructor.
  const { data: surveyRecord, error: surveyFetchError } = await supabase
    .from('surveys')
    .select('id')
    .eq('name', this_survey_name)
    .single();
  if (surveyFetchError || !surveyRecord) {
    throw new Error(surveyFetchError?.message || 'Survey record not found.');
  }

  const { data: responses, error: responseError } = await supabase
    .from('instructor_survey_responses')
    .select('instructor_id')
    .eq('instructor_id', user.id)
    .eq('survey_id', surveyRecord.id)
    .eq('survey_n', this_survey_n);

  const surveyCompleted = responses && responses.length > 0;

  if (surveyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 overflow-hidden">
        <h1 className="text-2xl font-bold text-green-700">Survey Completed!</h1>
        <p className="text-gray-700 mt-4">
          Thank you for completing the survey. You may now proceed to the next step.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 overflow-hidden">
      <iframe
        src={uniqueLink}
        title="Qualtrics Survey"
        className="w-full h-screen border-none"
        style={{ maxWidth: '100%' }}
        allowFullScreen
      ></iframe>
    </div>
  );
}