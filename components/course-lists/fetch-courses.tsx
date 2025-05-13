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

      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('title, short_id, id')
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
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
        <th className="px-4 py-2 border border-gray-300">Title</th>
        
          </tr>
        </thead>
        <tbody className="bg-white">
          {courses.map((course) => (
        <tr key={course.id} className="hover:bg-gray-50">
          <td className="px-4 py-2 border border-gray-300">{course.title}</td>
        </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-5 text-center">
        <Link href="/courses/add-course">
          <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold no-underline cursor-pointer">
        + Add New Course
          </span>
        </Link>
      </div>
    </div>
  );
}
