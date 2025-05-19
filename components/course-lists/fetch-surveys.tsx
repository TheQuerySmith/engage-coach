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

      // Fetch courses along with linked instructor survey responses.
      // The join uses the table "instructor_course_survey_responses" as defined in your README.
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          short_id,
          instructor_course_survey_responses (
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
      <h2 className="text-xl font-bold mb-4">Course Surveys</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border border-gray-300">Course Title</th>
            <th className="px-4 py-2 border border-gray-300">Survey 1 Completed</th>
            <th className="px-4 py-2 border border-gray-300">Survey 2 Completed</th>
            <th className="px-4 py-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {courses.map((course) => {
            // Get the instructor survey responses for survey 1 and survey 2.
            const responses = course.instructor_course_survey_responses || [];
            const survey1 = responses.find((r: any) => r.survey_n === 1);
            const survey2 = responses.find((r: any) => r.survey_n === 2);

            console.log('Course:', course);
            console.log('Responses:', responses);

            return (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-300">
                  <Link href={`/courses/${course.short_id}`} className="text-blue-600 hover:underline">
                    {course.title}
                  </Link>
                </td>
                <td className="px-4 py-2 border border-gray-300 text-center">
                  {survey1 && survey1.status === "Completed" ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 border border-gray-300 text-center">
                  {survey2 && survey2.status === "Completed" ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  <Link
                    href={`/courses/${course.short_id}/survey`}
                    className="text-blue-600 hover:underline"
                  >
                    View/Complete Surveys
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}