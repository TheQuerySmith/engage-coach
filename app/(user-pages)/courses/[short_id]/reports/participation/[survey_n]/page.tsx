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

const statusRank: { [key: string]: number } = {
  'Not Started': 1,
  'In Progress': 2,
  'Completed': 3,
};

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

  // Query all student survey responses for this course and survey number including updated_at,
  // along with first_name and last_name.
  const { data: responses, error: responsesError } = await supabase
    .from('student_course_survey_responses')
    .select('student_id, first_name, last_name, status, updated_at')
    .eq('course_id', course.id)
    .eq('survey_n', surveyN)
    .in('status', ['Not Started', 'In Progress', 'Completed']);

  if (responsesError) {
    throw new Error(responsesError.message);
  }

  // For each student_id, keep only one record with the furthest progress.
  const bestResponseMap = new Map<string, any>();
  for (const resp of responses || []) {
    const sid = resp.student_id;
    const currentRank = statusRank[resp.status] || 0;
    if (!bestResponseMap.has(sid)) {
      bestResponseMap.set(sid, resp);
    } else {
      const existing = bestResponseMap.get(sid);
      const existingRank = statusRank[existing.status] || 0;
      // If current response has higher rank, or equal rank but later updated_at, then update.
      if (currentRank > existingRank || 
         (currentRank === existingRank && new Date(resp.updated_at) > new Date(existing.updated_at))) {
        bestResponseMap.set(sid, resp);
      }
    }
  }

  const bestResponses = Array.from(bestResponseMap.values());

  // Group best responses by status.
  let notStarted = bestResponses.filter((r: any) => r.status === 'Not Started');
  let inProgress = bestResponses.filter((r: any) => r.status === 'In Progress');
  let completed = bestResponses.filter((r: any) => r.status === 'Completed');

  // Sort each group alphabetically by student_id.
  notStarted.sort((a, b) => a.student_id.localeCompare(b.student_id));
  inProgress.sort((a, b) => a.student_id.localeCompare(b.student_id));
  completed.sort((a, b) => a.student_id.localeCompare(b.student_id));

  // Helper function to format name.
  const formatName = (resp: any) => {
    return ((resp.first_name || resp.last_name)
      ? `${resp.first_name ?? ''} ${resp.last_name ?? ''}`.trim() 
      : '');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Participation Report for {course.title} ({course.department} {course.number_code}): Survey {surveyN}
      </h1>

      {/* Overall CSV Export */}
      {bestResponses.length > 0 && (
        <div className="mb-4">
          <SaveToCsvButton data={bestResponses} buttonText="Click here to download participant.csv file" />
        </div>
      )}

      {/* Search  */}
      <form method="get" action={`/courses/${course.short_id}/reports/participation/search`} className="mb-4">
        <input
          type="text"
          name="query"
          placeholder="Search by Student ID or Name"
          className="p-2 border rounded w-64 mr-2"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Search for Student
        </button>
      </form>

      {/* Completed */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Completed ({completed.length})
        </h2>
        {completed.length === 0 ? (
          <p>No student responses with status "Completed".</p>
        ) : (
          <table className="w-2/3 border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Student ID</th>
                <th className="px-4 py-2 border border-gray-300">Name</th>
                <th className="px-4 py-2 border border-gray-300">Date Completed</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((resp: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    {resp.student_id}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {formatName(resp)}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {resp.updated_at ? new Date(resp.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* In Progress */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          In Progress ({inProgress.length})
        </h2>
        {inProgress.length === 0 ? (
          <p>No student responses with status "In Progress".</p>
        ) : (
          <table className="w-2/3 border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Student ID</th>
                <th className="px-4 py-2 border border-gray-300">Name</th>
                <th className="px-4 py-2 border border-gray-300">Date Started</th>
              </tr>
            </thead>
            <tbody>
              {inProgress.map((resp: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    {resp.student_id}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {formatName(resp)}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {resp.updated_at ? new Date(resp.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Not Started */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Not Started ({notStarted.length}){' '}
          <Link
          href={`/courses/${course.short_id}/upload-student-list`}
          title="If you'd like to track your student participation rates, you can upload a list of student ids here"
          className="text-blue-600 hover:underline"
        >
          (Click here to upload list of student ids)
        </Link>
        </h2>
        {notStarted.length === 0 ? (
          <p>No student responses with status "Not Started".</p>
        ) : (
          <table className="w-2/3 border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Student ID</th>
                <th className="px-4 py-2 border border-gray-300">Name</th>
              </tr>
            </thead>
            <tbody>
              {notStarted.map((resp: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    {resp.student_id}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {formatName(resp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="mt-4">
        <Link
          href={`/courses/${course.short_id}/reports`}
          className="text-blue-600 hover:underline"
        >
          Back to Course Reports
        </Link>
      </div>
    </div>
  );
}