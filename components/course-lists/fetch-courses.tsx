'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCourses = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/sign-in');
        return;
      }

      // Updated query to include department and number_code
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('title, short_id, id, department, number_code')
        .eq('user_id', user.id);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setCourses(data);
      }
    };

    fetchCourses();
  }, [router]);

  if (error) {
    return <p>Failed to load courses: {error}</p>;
  }

  return (
    <div>
      {courses.length > 5 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          You seem to have a lot of courses. You will receive a separate report for each course, so if you are teaching many similar courses, we recommend merging them so that you can better understand your student data.
        </div>
      )}
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border border-gray-300">Title (Click for details)</th>
            <th className="px-4 py-2 border border-gray-300">Next Survey Dates</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border border-gray-300">
                <Link
                  href={`/courses/${course.short_id}`}
                  className="hover:underline"
                >
                  {course.title} ({course.department} {course.number_code})
                </Link>
              </td>
              <td className="px-4 py-2 border border-gray-300">

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
