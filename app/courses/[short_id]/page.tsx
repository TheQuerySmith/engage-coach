'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DeleteCourse from '@/components/course-lists/DeleteCourse';
import { ToastContainer, toast } from "react-toastify";


export default function CourseDetails() {
  const router = useRouter();
  const params = useParams() as { short_id: string };
  const { short_id } = params;
  const supabase = createClient();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/sign-in');
        return;
      }
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_survey_windows (
            survey_n,
            open_at,
            close_at
          )
        `)
        .eq('short_id', short_id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setCourse(data);
      setLoading(false);
    };

    fetchCourse();
  }, [short_id, router, supabase]);

  if (loading) return <p>Loading...</p>;
  if (error || !course) return <p className="text-red-600">{error || 'Course not found.'}</p>;

  // Build survey windows: For each survey (1 and 2) display dates (if set)
  const surveys = [1, 2];
  const surveyWindows = surveys.map((survey_n) => {
    const windowData = course.course_survey_windows?.find((w: any) => w.survey_n === survey_n);
    let displayText = 'Not set';
    if (windowData) {
      const openDate = new Date(windowData.open_at);
      const closeDate = new Date(windowData.close_at);
      displayText = `Opens: ${openDate.toLocaleString()} - Closes: ${closeDate.toLocaleString()}`;
    }
    return { survey_n, displayText };
  });

  // Construct survey links
  const qualtricsBase = "https://utexas.qualtrics.com/jfe/form/SV_b7PqMufNgIi0Jjo";
  const instructorLinks = surveys.map((survey_n) => {
    return `/surveys/instructor/${survey_n}?course_id=${course.id}`;
  });
  const studentLinks = surveys.map((survey_n) => {
    return `${qualtricsBase}?course_id=${course.id}&survey_n=${survey_n}`;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{course.title} ({course.department} {course.number_code})</h1>
        
      </div>
      <p className="mb-4"><strong>Course Details: </strong>{course.format} {course.type} with approximately {course.n_students} Students across {course.n_sections} Section{course.n_sections > 1 ? 's' : ''}</p>
      <details className="mb-4">
        <summary className="cursor-pointer hover:underline">
          Show student details
        </summary>
        <p className="mt-4"><strong>Percentage Majors:</strong> {course.pct_majors}%</p>
        <p><strong>Percentage STEM:</strong> {course.pct_STEM}%</p>
        <p><strong>General Education:</strong> {course.general_education}</p>
        <p><strong>Level:</strong> {course.level}</p>
        <p><strong>Additional Info:</strong> {course.additional_info}</p>
        <p><strong>Percentage Instructor Decision:</strong> {course.pct_instructor_decision}%</p>
        <p><strong>Percentage Instructor Synchronous:</strong> {course.pct_instructor_synchronous}%</p>
        <p><strong>Percentage Instructor Asynchronous:</strong> {course.pct_instructor_asynchronous}%</p>
      </details>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Link
          href={`/courses/${course.short_id}/edit`}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 shadow-md"
        >
          Edit Course Details
        </Link>
        <Link
          href={`/courses/${course.short_id}/set-dates`}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 shadow-md"
        >
          Edit Survey Dates
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Survey Dates &amp; Links</h2>
        
        <div className="mb-8">
          {surveys.map((survey_n, index) => (
            <div key={survey_n} className="mb-6 border p-4 rounded text-center">
              <h3 className="text-lg font-semibold mb-2 text-center">Survey {survey_n}</h3>
              <p className="mb-2">{surveyWindows[index].displayText}</p>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="font-medium"><strong>Instructor Survey Link:</strong>{' '}
                  <Link href={instructorLinks[index]} className="text-blue-600 hover:underline">
                    Click here to take the instructor survey 
                  </Link>
                  </p>
                </div>
                <div>
                  <p className="font-medium"><strong>Student Survey Link:</strong>{' '}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(studentLinks[index]);
                        toast.success("Copied to clipboard!");
                      }}
                      className="text-blue-600 hover:underline"
                      title="Copy to clipboard"
                    >
                      Click here to copy to clipboard
                    </button>
                  </p>
                  
                    <details>
                    <summary className="text-gray-600 hover:underline">
                      Show full student link
                    </summary>
                    <div className="mt-2">
                      <a href={studentLinks[index]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {studentLinks[index]}
                      </a>
                    </div>
                    </details>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <DeleteCourse courseId={course.id} />
      </div>
      <ToastContainer position="bottom-right" autoClose={1500} limit={3} />
    </div>
  );
}