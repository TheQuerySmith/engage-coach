'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function FetchSurveys() {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSurveyData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/sign-in');
        return;
      }

      // Fetch courses along with linked instructor responses, survey windows, and student responses.
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          department,
          number_code,
          short_id,
          instructor_course_survey_responses (
            survey_n,
            status
          ),
          course_survey_windows (
            survey_n,
            open_at,
            close_at
          ),
          student_course_survey_responses (
            survey_n,
            status
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCourses(data || []);
      }
    };

    fetchSurveyData();
  }, [router, supabase]);

  if (error) {
    return <p>Failed to load surveys: {error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">My Courses and Surveys</h2>
      {courses.map((course) => (
        <div key={course.id} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">
            <Link
              href={`/courses/${course.short_id}`}
              className="text-blue-600 hover:underline"
            >
              {course.title} ({course.department} {course.number_code})
            </Link>
          </h3>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Survey</th>
                <th className="px-4 py-2 border border-gray-300">
                  Instructor Completed?
                </th>
                <th className="px-4 py-2 border border-gray-300">
                  N Students Completed?
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((survey_n) => {
                // Get the survey window information for this survey number.
                const windowData = course.course_survey_windows?.find(
                  (w: any) => w.survey_n === survey_n
                );
                const now = new Date();
                let openInfo = '';
                if (windowData) {
                  const openDate = new Date(windowData.open_at);
                  if (now < openDate) {
                    openInfo = `Opens ${openDate.toLocaleDateString()}`;
                  }
                }
                // Get instructor's response.
                const instResp = course.instructor_course_survey_responses?.find(
                  (r: any) => r.survey_n === survey_n
                );
                const instructorCompleted =
                  instResp && instResp.status === 'Completed' ? 'Yes' : 'No';
                // Count student completions.
                const studentsCompleted =
                  course.student_course_survey_responses?.filter(
                    (r: any) =>
                      r.survey_n === survey_n && r.status === 'Completed'
                  ).length || 0;

                // Determine text color for instructor and student responses
                const instructorColor = !openInfo
                  ? instructorCompleted === 'Yes'
                    ? 'text-green-600'
                    : 'text-red-600'
                  : '';
                const studentColor = !openInfo
                  ? studentsCompleted < 12
                    ? 'text-red-600'
                    : 'text-green-600'
                  : '';

                return (
                  <tr key={survey_n} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300">
                      {`Survey ${survey_n}`}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      {openInfo ? (
                        openInfo
                      ) : (
                        <span className={instructorColor}>{instructorCompleted}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      {openInfo ? (
                        openInfo
                      ) : (
                        <span className={studentColor}>{studentsCompleted}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}