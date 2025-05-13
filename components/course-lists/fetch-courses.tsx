import { createClient } from '@/utils/supabase/server'
// Removed unused import for TutorialStep
import { redirect } from "next/navigation";


export default async function CourseList() {
const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: courses, error: fetchError } = await supabase
    .from('courses')
    .select('title, short_id, id')
    .eq('user_id', user.id)

  if (fetchError) {
    console.error(fetchError)
    return "Failed to load your checklist."; // Replaced JSX with a string
  }

  // Removed unused completedMap variable

  console.log(' 🔍 checklist entries:', courses)
  console.log(
    ' ✅ completedMap:',
    Array.from(new Map(courses.map(e => [e.title, e.short_id, e.id])))
  )

    const completedMap = Array.from(
      new Map(
        courses.map(e => [e.title, { short_id: e.short_id, id: e.id }])
      ).entries()
    ).map(([title, { short_id, id }]) => ({ title, short_id, id }));

    return (
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Short ID</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {completedMap.map(course => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.short_id}</td>
              <td>{course.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
}
