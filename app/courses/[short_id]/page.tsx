import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CourseDetails({ params }: { params: { short_id: string } }) {
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
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <p className="mb-4">Short ID: {course.short_id}</p>
      <p className="mb-4">Course ID: {course.id}</p>
      <p className="mb-4">Description: {course.description || "No description available."}</p>

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

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Edit Course Details</h2>
        {/* Add form or link to edit course details */}
        <a href="#" className="text-blue-600 hover:underline">
          Edit Course
        </a>
      </div>
    </div>
  );
}