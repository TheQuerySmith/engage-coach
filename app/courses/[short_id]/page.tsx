import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteCourse from "@/components/course-lists/DeleteCourse";

export default async function CourseDetails(props: { params: Promise<{ short_id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("short_id", params.short_id)
    .single();

  if (error || !course) {
    console.error("Error fetching course details for short_id:", params.short_id, error);
    return <p>Course not found.</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {/* Edit button */}
        
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Survey Links</h2>
        {/* Add survey links here */}
        <ul>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Survey Link 1
            </a>
          </li>
          <li>
            <a href="#" className="text-blue-600 hover:underline">
              Survey Link 2
            </a>
          </li>
        </ul>
      </div>

      <p className="mb-4"><strong>Short ID:</strong> {course.short_id}</p>
      <p className="mb-4"><strong>Course ID:</strong> {course.id}</p>
      <p className="mb-4"><strong>Created:</strong> {new Date(course.created_at).toLocaleString()}</p>
      <p className="mb-4"><strong>Department:</strong> {course.department}</p>
      <p className="mb-4"><strong>Course Number Code:</strong> {course.number_code}</p>
      <p className="mb-4"><strong>Number of Sections:</strong> {course.n_sections}</p>
      <p className="mb-4"><strong>Number of Students:</strong> {course.n_students}</p>
      <p className="mb-4"><strong>Percentage Majors:</strong> {course.pct_majors}%</p>
      <p className="mb-4"><strong>Percentage STEM:</strong> {course.pct_STEM}%</p>
      <p className="mb-4"><strong>General Education:</strong> {course.general_education}</p>
      <p className="mb-4"><strong>Level:</strong> {course.level}</p>
      <p className="mb-4"><strong>Type:</strong> {course.type}</p>
      <p className="mb-4"><strong>Format:</strong> {course.format}</p>
      <p className="mb-4"><strong>Additional Info:</strong> {course.additional_info}</p>
      <p className="mb-4"><strong>Percentage Instructor Decision:</strong> {course.pct_instructor_decision}%</p>
      <p className="mb-4"><strong>Percentage Instructor Synchronous:</strong> {course.pct_instructor_synchronous}%</p>
      <p className="mb-4"><strong>Percentage Instructor Asynchronous:</strong> {course.pct_instructor_asynchronous}%</p>

      <div className="flex items-center gap-4 mb-6">

      <Link
        href={`/courses/${course.short_id}/edit`}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Edit Course Details
      </Link>
      {/* Delete button (client component) */}
      <DeleteCourse courseId={course.id} />
      </div>
    </div>
  );
}