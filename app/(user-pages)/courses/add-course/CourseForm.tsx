'use client';

import { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface CourseFormProps {
  onSuccess: (message: string) => void;
}

export default function CourseForm({ onSuccess }: CourseFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Course fields based on the schema
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [numberCode, setNumberCode] = useState('');
  const [nSections, setNSections] = useState(1);
  const [nStudents, setNStudents] = useState(0);
  const [pctMajors, setPctMajors] = useState(0);
  const [pctSTEM, setPctSTEM] = useState(0);
  // New dropdown fields with "Other" defaults
  const [generalEducation, setGeneralEducation] = useState('Unsure/Other');
  const [level, setLevel] = useState('Other');
  const [courseType, setCourseType] = useState('Lecture');
  const [format, setFormat] = useState('In-Person');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [pctInstructorDecision, setPctInstructorDecision] = useState(0);
  const [pctInstructorSynchronous, setPctInstructorSynchronous] = useState(0);
  const [pctInstructorAsynchronous, setPctInstructorAsynchronous] = useState(0);

  useEffect(() => {
    async function fetchDepartment() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (user && !userError) {
        const { data, error } = await supabase
          .from('profiles')
          .select('department')
          .eq('id', user.id)
          .single();
        if (!error && data?.department) {
          setDepartment(data.department);
        }
      }
    }
    fetchDepartment();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      alert('User not authenticated');
      return;
    }

    const { error, data: insertedCourses } = await supabase.from('courses').insert([
      {
        user_id: user.id,
        title,
        department,
        number_code: numberCode,
        n_sections: nSections,
        n_students: nStudents,
        pct_majors: pctMajors,
        pct_stem: pctSTEM,
        general_education: generalEducation,
        level: level,
        type: courseType,
        format: format,
        additional_info: additionalInfo,
        pct_instructor_decision: pctInstructorDecision,
        pct_instructor_synchronous: pctInstructorSynchronous,
        pct_instructor_asynchronous: pctInstructorAsynchronous,
      },
    ])
    .select('*');

    if (error) {
      alert("Error adding course: " + error.message);
    } else if (insertedCourses && insertedCourses.length > 0) {
      const newCourse = insertedCourses[0];
      console.log("New course inserted:", newCourse);
      onSuccess("Course added successfully!");
      // Redirect to the newly created course details page using its short_id
      router.push(`/courses/${newCourse.short_id}/set-dates`);
    } else {
      console.error("No data returned from insert", insertedCourses);
      alert("Course was added, but could not retrieve new course data.");
      router.push("/courses");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
      <label className="flex flex-col">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />
      </label>
      <label className="flex flex-col">
        Department:
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border p-2 rounded"
        />
      </label>
      <label className="flex flex-col">
        Course Number Code:
        <input
          type="text"
          value={numberCode}
          onChange={(e) => setNumberCode(e.target.value)}
          className="border p-2 rounded"
        />
      </label>
      <label className="flex flex-col">
        Number of Sections:
        <input
          type="number"
          value={nSections}
          onChange={(e) => setNSections(Number(e.target.value))}
          className="border p-2 rounded"
          min={1}
          required
        />
      </label>

      <hr className="my-8 border-t-2 border-gray-300" />
      <h2 className="text-2xl font-semibold mb-4">Course Format</h2>
      <label className="flex flex-col">
        Format:
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="In-Person">In-Person</option>
          <option value="Online">Online</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label className="flex flex-col">
        Percentage Instructor Decision: {pctInstructorDecision}%
        <input
          type="range"
          min="0"
          max="100"
          value={pctInstructorDecision}
          onChange={(e) => setPctInstructorDecision(Number(e.target.value))}
          className="accent-blue-600"
        />
      </label>
      <label className="flex flex-col">
        Percentage Instructor Synchronous: {pctInstructorSynchronous}%
        <input
          type="range"
          min="0"
          max="100"
          value={pctInstructorSynchronous}
          onChange={(e) =>
            setPctInstructorSynchronous(Number(e.target.value))
          }
          className="accent-blue-600"
        />
      </label>
      <label className="flex flex-col">
        Percentage Instructor Asynchronous: {pctInstructorAsynchronous}%
        <input
          type="range"
          min="0"
          max="100"
          value={pctInstructorAsynchronous}
          onChange={(e) =>
            setPctInstructorAsynchronous(Number(e.target.value))
          }
          className="accent-blue-600"
        />
      </label>

      <hr className="my-8 border-t-2 border-gray-300" />
      <h2 className="text-2xl font-semibold mb-4">Student Population</h2>
      <label className="flex flex-col">
        Number of Students:
        <input
          type="number"
          value={nStudents}
          onChange={(e) => setNStudents(Number(e.target.value))}
          className="border p-2 rounded"
          min={0}
        />
      </label>
      <label className="flex flex-col">
        Percentage of Majors: {pctMajors}%
        <input
          type="range"
          min="0"
          max="100"
          value={pctMajors}
          onChange={(e) => setPctMajors(Number(e.target.value))}
          className="accent-blue-600"
        />
      </label>
      <label className="flex flex-col">
        Percentage STEM: {pctSTEM}%
        <input
          type="range"
          min="0"
          max="100"
          value={pctSTEM}
          onChange={(e) => setPctSTEM(Number(e.target.value))}
          className="accent-blue-600"
        />
      </label>
      <label className="flex flex-col">
        General Education:
        <select
          value={generalEducation}
          onChange={(e) => setGeneralEducation(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Unsure/Other">Unsure/Other</option>
        </select>
      </label>
      <label className="flex flex-col">
        Level:
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Introductory Undergrade">Introductory Undergrade</option>
          <option value="Advanced Undergraduate">Advanced Undergraduate</option>
          <option value="Graduate">Graduate</option>
          <option value="Other">Other</option>
        </select>
      </label>
      
      <label className="flex flex-col">
        Type:
        <select
          value={courseType}
          onChange={(e) => setCourseType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Lecture">Lecture</option>
          <option value="Lab">Lab</option>
          <option value="Seminar/Discussion">Seminar/Discussion</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <hr className="my-8 border-t-2 border-gray-300" />
      <h2 className="text-2xl font-semibold mb-4">Additional Information</h2>
      <label className="flex flex-col">
        Additional Info:
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="border p-2 rounded"
          rows={4}
        />
      </label>
      
      <button
        type="submit"
        className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        Add Course
      </button>
    </form>
  );
}