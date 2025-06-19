import CourseForm from '@/app/(user-pages)/courses/add-course/CourseForm';

interface EditCourseFormProps {
  initialCourse: any;
}

export default function EditCourseForm({ initialCourse }: EditCourseFormProps) {
  return <CourseForm initialCourse={initialCourse} />;
}