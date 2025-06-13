import Link from 'next/link';
import DeleteCourse from '@/components/course-lists/DeleteCourse';
import CopyButton from '@/components/CopyButton';
import { getSurveyLink } from '@/utils/supabase/surveys';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface CourseDetailsProps {
  params: Promise<{
    short_id: string;
  }>;
}

export default async function CourseDetails(props: CourseDetailsProps) {
  const params = await props.params;
  const { short_id } = params;
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/sign-in');
  }

  // Fetch the course data
  const { data: course, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      course_survey_windows (
        survey_n,
        open_at,
        close_at
      ),
      instructor_course_survey_responses (
        survey_n,
        updated_at
      )
    `
    )
    .eq('short_id', short_id)
    .single();

  if (error || !course) {
    throw new Error(error?.message || 'Course not found.');
  }

  // Define the surveys we support
  const surveys = [1, 2];

  // Fetch survey links using the helper function for student links.
  const stuPromises = surveys.map((survey_n) =>
    getSurveyLink({
      surveyName: 'Student Course Survey 2025',
      surveyN: survey_n,
      courseId: course.id,
    })
  );
  const studentLinks = await Promise.all(stuPromises);

  // Build survey windows display text.
  const surveyWindows = surveys.map((survey_n) => {
    const windowData = course.course_survey_windows?.find(
      (w: any) => w.survey_n === survey_n
    );
    let displayText = 'Not set';
    if (windowData) {
      const openDate = new Date(windowData.open_at);
      const closeDate = new Date(windowData.close_at);
      displayText = `${openDate.toLocaleDateString()} to ${closeDate.toLocaleDateString()}`;
    }
    return { survey_n, displayText, windowData };
  });

  const now = new Date();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {course.title} ({course.department} {course.number_code})
        </h1>
      </div>
      <p className="mb-4">
        <strong>Course Details: </strong>
        {course.format} {course.type} with approximately {course.n_students} Students
        across {course.n_sections} Section{course.n_sections > 1 ? 's' : ''}
      </p>
      <details className="mb-4">
        <summary className="cursor-pointer hover:underline">Show student details</summary>
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
          {surveys.map((survey_n, index) => {
            // Get window info
            const { windowData, displayText } = surveyWindows[index];
            const openDate = windowData ? new Date(windowData.open_at) : null;
            // Check if instructor has already completed this survey
            const instructorResponse = course.instructor_course_survey_responses?.find(
              (r: any) => r.survey_n === survey_n
            );
            const completed = instructorResponse != null;
            return (
              <div key={survey_n} className="mb-6 border p-4 rounded text-center">
                <h3 className="text-lg font-semibold mb-2">Survey {survey_n}</h3>
                <p className="mb-2">
                  <strong>Scheduled: </strong>{' '}
                  {displayText}
                </p>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="font-medium">
                      <strong>Instructor Survey Link:</strong>{' '}
                      {openDate && now < openDate ? (
                        <span>
                          Please come back on {openDate.toLocaleDateString()} to complete your survey
                        </span>
                      ) : completed ? (
                        <span>
                          You have already completed this survey on{' '}
                          {new Date(instructorResponse.updated_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <Link
                          href={`/courses/${course.short_id}/instructor-survey/${survey_n}`}
                          className="text-blue-600 hover:underline"
                        >
                          Click here to take the instructor survey
                        </Link>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="font-medium">
                      <strong>Student Survey Link:</strong>{' '}
                      {studentLinks[index] ? (
                        <CopyButton
                          copyText={studentLinks[index]}
                          buttonLabel="Click here to copy the student survey link"
                        />
                      ) : (
                        'Not available'
                      )}
                    </div>
                    {studentLinks[index] && (
                      <details className="text-gray-600 hover:underline">
                        <summary className="cursor-pointer">Show full student link</summary>
                        <div className="mt-2">
                          <a
                            href={studentLinks[index]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {studentLinks[index]}
                          </a>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <DeleteCourse courseId={course.id} />
      </div>
    </div>
  );
}