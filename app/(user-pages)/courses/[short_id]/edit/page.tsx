import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import CourseForm from '@/app/(user-pages)/courses/add-course/CourseForm';

export default async function EditCoursePage(props: { params: Promise<{ short_id: string }> }) {
  const params = await props.params;
  const { short_id } = params;
  const supabase = await createClient();

  // Fetch the course details using short_id
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('short_id', short_id)
    .single();

  if (error || !course) {
    redirect('/courses');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
      <CourseForm initialCourse={course} />
    </div>
  );
}