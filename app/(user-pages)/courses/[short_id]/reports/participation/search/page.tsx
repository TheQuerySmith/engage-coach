import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

interface SearchPageProps {
  params: {
    short_id: string;
    survey_n: string;
  };
  searchParams: {
    query?: string;
  };
}

const statusRank: { [key: string]: number } = {
  'Not Started': 1,
  'In Progress': 2,
  'Completed': 3,
};

export default async function SearchResultsPage({ params, searchParams }: SearchPageProps) {
  const { short_id } = params;
  const query = searchParams.query ? searchParams.query.trim() : '';

  const supabase = await createClient();

  // Fetch the course details.
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, department, number_code, short_id')
    .eq('short_id', short_id)
    .single();
  if (courseError || !course) throw new Error(courseError?.message || 'Course not found');

  // Fetch all student survey responses across all surveys for the course.
  const { data: responses, error: responsesError } = await supabase
    .from('student_course_survey_responses')
    .select('student_id, first_name, last_name, status, updated_at, survey_n')
    .eq('course_id', course.id)
    .in('status', ['Not Started', 'In Progress', 'Completed']);
  if (responsesError) throw new Error(responsesError.message);

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
      if (currentRank > existingRank || (currentRank === existingRank && new Date(resp.updated_at) > new Date(existing.updated_at))) {
        bestResponseMap.set(sid, resp);
      }
    }
  }
  const bestResponses = Array.from(bestResponseMap.values());

  // Filter responses by the search query (searching in student_id and concatenated name).
  const lowerQuery = query.toLowerCase();
  const filtered = query
    ? bestResponses.filter(resp => {
        const sid = resp.student_id.toLowerCase();
        const fullName = (resp.first_name || resp.last_name)
          ? `${resp.first_name ?? ''} ${resp.last_name ?? ''}`.trim().toLowerCase()
          : '';
        return sid.includes(lowerQuery) || fullName.includes(lowerQuery);
      })
    : bestResponses;
  
  // Helper function to format name.
  const formatName = (resp: any) =>
    (resp.first_name || resp.last_name)
      ? `${resp.first_name ?? ''} ${resp.last_name ?? ''}`.trim()
      : '';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{query}" in {course.title} (All Surveys)
      </h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border border-gray-300">Student ID</th>
            <th className="px-4 py-2 border border-gray-300">Name</th>
            <th className="px-4 py-2 border border-gray-300">Survey Number</th>
            <th className="px-4 py-2 border border-gray-300">Status</th>
            <th className="px-4 py-2 border border-gray-300">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td className="px-4 py-2 border border-gray-300" colSpan={5}>
                No participants match your search.
              </td>
            </tr>
          ) : (
            filtered.map((resp: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-300">{resp.student_id}</td>
                <td className="px-4 py-2 border border-gray-300">{formatName(resp)}</td>
                <td className="px-4 py-2 border border-gray-300">{resp.survey_n}</td>
                <td className="px-4 py-2 border border-gray-300">{resp.status}</td>
                <td className="px-4 py-2 border border-gray-300">
                  {resp.updated_at ? new Date(resp.updated_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="mt-4">
        <Link href={`/courses/${course.short_id}/reports/participation/${params.survey_n}`} className="text-blue-600 hover:underline">
          Back to Participation Report
        </Link>
      </div>
    </div>
  );
}