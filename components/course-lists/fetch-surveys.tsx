import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function FetchSurveys() {
  const supabase = await createClient();

  // Get the current user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/sign-in');
  }
  const currentUser = user;

  // Fetch all courses along with related survey data for the current user.
  const { data: courses, error: courseError } = await supabase
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
    .eq('user_id', currentUser.id);
  if (courseError || !courses) {
    return <p>Failed to load courses: {courseError?.message}</p>;
  }

  // Fetch base links from the surveys table.
  const { data: instData } = await supabase
    .from('surveys')
    .select('link')
    .eq('name', 'Instructor Baseline Survey 2025')
    .single();
  const { data: studData } = await supabase
    .from('surveys')
    .select('link')
    .eq('name', 'Student Course Survey 2025')
    .single();
  const instructorBase = instData?.link || '';
  const studentBase = studData?.link || '';

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">My Courses and Surveys</h2>
      {courses.map((course: any) => (
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
              {[1, 2].map((survey_n: number) => {
                // Compute survey window information.
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

                // Get instructor survey response.
                const instResp = course.instructor_course_survey_responses?.find(
                  (r: any) => r.survey_n === survey_n
                );
                const instructorCompleted =
                  instResp && instResp.status === 'Completed'
                    ? 'Completed'
                    : 'Not Completed';

                // Count student completions. Convert stored survey_n to number for accurate matching.
                const studentsCompleted =
                  course.student_course_survey_responses?.filter(
                    (r: any) =>
                      Number(r.survey_n) === survey_n && r.status === 'Completed'
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

                // Construct dynamic survey links.
                // For instructor survey, construct an internal link.
                const instructorSurveyLink =
                  `/courses/${course.short_id}/instructor-survey/${survey_n}`;
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
                            target="_blank"
                            rel="noopener noreferrer"
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