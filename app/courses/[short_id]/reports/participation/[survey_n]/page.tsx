import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SaveToCsvButton from '@/components/SaveCsv';

interface ParticipationPageProps {
  params: {
    short_id: string;
    survey_n: string;
  };
}

export default async function ParticipationPage({ params }: ParticipationPageProps) {
  const { short_id, survey_n } = params;
  const surveyN = Number(survey_n);
  const supabase = await createClient();

  // Fetch the course using the provided short_id.
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, department, number_code, short_id')
    .eq('short_id', short_id)
    .single();

  if (courseError || !course) {
    throw new Error(courseError?.message || 'Course not found');
  }

  // Query all student survey responses for this course and survey number.
  const { data: responses, error: responsesError } = await supabase
    .from('student_course_survey_responses')
    .select('student_id, status')
    .eq('course_id', course.id)
    .eq('survey_n', surveyN);

  if (responsesError) {
    throw new Error(responsesError.message);
  }

  // Define a custom sort order.
  const statusOrder: { [key: string]: number } = {
    'Not Started': 1,
    'In Progress': 2,
    'Completed': 3,
  };

  // Sort responses based on the defined order.
  const sortedResponses = (responses || []).sort((a, b) => {
    const orderA = statusOrder[a.status] || 4;
    const orderB = statusOrder[b.status] || 4;
    return orderA - orderB;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Participation Report for Survey {surveyN}</h1>
      <p className="mb-4">
        Course: {course.title} ({course.department} {course.number_code})
      </p>
      {sortedResponses.length === 0 ? (
        <p>No student responses found for this survey.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border border-gray-300">Student ID</th>
              <th className="px-4 py-2 border border-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedResponses.map((resp: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-300">{resp.student_id}</td>
                <td className="px-4 py-2 border border-gray-300">{resp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Render the Save to CSV button if there are responses */}
      {sortedResponses.length > 0 && <SaveToCsvButton data={sortedResponses} />}
      <div className="mt-4">
        <Link href={`/courses/${course.short_id}/reports`} className="text-blue-600 hover:underline">
          Back to Course Reports
        </Link>
      </div>
    </div>
  );
}