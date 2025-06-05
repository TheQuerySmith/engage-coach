import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import EditCourseForm from './EditCourseForm';

interface EditCoursePageProps {
  params: { short_id: string };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
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
      <EditCourseForm initialCourse={course} />
    </div>
  );
}