'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import CopyButton from '@/components/CopyButton';

export default function FetchSurveys() {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [instructorBase, setInstructorBase] = useState<string>('');
  const [studentBase, setStudentBase] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  // Fetch user and survey records for instructor and student surveys.
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
      setCurrentUser(user);

      // Fetch courses along with linked instructor responses, survey windows, and student responses.
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          department,
          number_code,
          short_id,
          instructor_course_survey_responses ( survey_n, status ),
          course_survey_windows ( survey_n, open_at, close_at ),
          student_course_survey_responses ( survey_n, status )
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCourses(data || []);
      }
    };

    // Fetch survey base links from the surveys table.
    const fetchSurveyRecords = async () => {
      // Fetch instructor survey record (make sure survey name matches your DB)
      const { data: instData, error: instError } = await supabase
        .from('surveys')
        .select('link')
        .eq('name', 'Instructor Personal Survey 2025')
        .single();
      if (!instError && instData) {
        setInstructorBase(instData.link);
      } else {
        console.error('Error fetching instructor survey record:', instError);
      }
      // Fetch student survey record (ensure survey name matches your DB)
      const { data: studData, error: studError } = await supabase
        .from('surveys')
        .select('link')
        .eq('name', 'Student Course Survey 2025')
        .single();
      if (!studError && studData) {
        setStudentBase(studData.link);
      } else {
        console.error('Error fetching student survey record:', studError);
      }
    };

    fetchSurveyData();
    fetchSurveyRecords();
  }, [router, supabase]);

  if (error) {
    return <p>Failed to load surveys: {error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">My Courses and Surveys</h2>
      {courses.map((course) => (
        <div key={course.id} className="mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold mb-2">
              <Link
                href={`/courses/${course.short_id}`}
                className="text-blue-600 hover:underline"
              >
                {course.title} ({course.department} {course.number_code})
              </Link>
            </h3>
            <Link
              href={`/courses/${course.short_id}/set-dates`}
              className="text-sm text-blue-500 hover:underline"
            >
              Edit survey dates
            </Link>
          </div>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Survey</th>
                <th className="px-4 py-2 border border-gray-300">Instructor Survey</th>
                <th className="px-4 py-2 border border-gray-300">Student Survey</th>
                <th className="px-4 py-2 border border-gray-300">Report Links</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((survey_n) => {
                // Get survey window info.
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
                // Get instructor response.
                const instResp = course.instructor_course_survey_responses?.find(
                  (r: any) => r.survey_n === survey_n
                );
                const instructorCompleted =
                  instResp && instResp.status === 'Completed'
                    ? 'Completed'
                    : 'Not Completed';
                // Count student completions.
                const studentsCompleted =
                  course.student_course_survey_responses?.filter(
                    (r: any) =>
                      r.survey_n === survey_n && r.status === 'Completed'
                  ).length || 0;

                // Determine text colors.
                const instructorColor = !openInfo
                  ? instructorCompleted === 'Completed'
                    ? 'text-green-600'
                    : 'text-red-600'
                  : '';
                const studentColor = !openInfo
                  ? studentsCompleted < 12
                    ? 'text-red-600'
                    : 'text-green-600'
                  : '';

                // Construct dynamic survey links:
                // For instructor survey, use the fetched instructorBase along with parameters.
                const instructorSurveyLink =
                  currentUser && instructorBase
                    ? `/surveys/instructor/${survey_n}?course_id=${course.id}`
                    : '';
                // For student survey, use the fetched studentBase.
                const studentSurveyLink = studentBase
                  ? `${studentBase}?course_id=${course.id}&survey_n=${survey_n}`
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
                        <span className={instructorColor}>
                          {instructorCompleted}{' '}
                          {instructorCompleted === 'Not Completed' && (
                            <Link
                              href={instructorSurveyLink}
                              className="text-blue-500 hover:underline"
                            >
                              (LINK)
                            </Link>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      {openInfo ? (
                        openInfo
                      ) : (
                        <span className={studentColor}>
                          {studentsCompleted}{' '}
                            <Link
                              href={studentSurveyLink}
                              className="text-blue-500 hover:underline"
                              target="_blank" rel="noopener noreferrer"
                            >
                              (LINK)
                            </Link>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      Not yet available
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