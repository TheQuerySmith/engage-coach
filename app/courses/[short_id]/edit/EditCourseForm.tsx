'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface EditCourseFormProps {
  initialCourse: any;
}

export default function EditCourseForm({ initialCourse }: EditCourseFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Initialize state with current course data.
  const [title, setTitle] = useState(initialCourse.title);
  const [department, setDepartment] = useState(initialCourse.department || '');
  const [numberCode, setNumberCode] = useState(initialCourse.number_code || '');
  const [nSections, setNSections] = useState(initialCourse.n_sections || 1);
  const [nStudents, setNStudents] = useState(initialCourse.n_students || 0);
  const [pctMajors, setPctMajors] = useState(initialCourse.pct_majors || 0);
  const [pctSTEM, setPctSTEM] = useState(initialCourse.pct_STEM || 0);
  const [generalEducation, setGeneralEducation] = useState(initialCourse.general_education || 'Other');
  const [level, setLevel] = useState(initialCourse.level || 'Other');
  const [courseType, setCourseType] = useState(initialCourse.type || 'Lecture');
  const [format, setFormat] = useState(initialCourse.format || 'In-Person');
  const [additionalInfo, setAdditionalInfo] = useState(initialCourse.additional_info || '');
  const [pctInstructorDecision, setPctInstructorDecision] = useState(initialCourse.pct_instructor_decision || 0);
  const [pctInstructorSynchronous, setPctInstructorSynchronous] = useState(initialCourse.pct_instructor_synchronous || 0);
  const [pctInstructorAsynchronous, setPctInstructorAsynchronous] = useState(initialCourse.pct_instructor_asynchronous || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('courses')
      .update({
        title,
        department,
        number_code: numberCode,
        n_sections: nSections,
        n_students: nStudents,
        pct_majors: pctMajors,
        pct_stem: pctSTEM,
        general_education: generalEducation,
        level,
        type: courseType,
        format,
        additional_info: additionalInfo,
        pct_instructor_decision: pctInstructorDecision,
        pct_instructor_synchronous: pctInstructorSynchronous,
        pct_instructor_asynchronous: pctInstructorAsynchronous,
      })
      .eq('id', initialCourse.id);
    
    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push(`/courses/${initialCourse.short_id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-600">{error}</p>}
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
        Number Code:
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
        Percentage Majors: {pctMajors}%
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
        <input
          type="text"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border p-2 rounded"
        />
      </label>
      <label className="flex flex-col">
        Course Type:
        <select
          value={courseType}
          onChange={(e) => setCourseType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Lecture">Lecture</option>
          <option value="Lab">Lab</option>
          <option value="Seminar/Discussion">Seminar/Discussion</option>
        </select>
      </label>
      <label className="flex flex-col">
        Format:
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="In-Person">In-Person</option>
          <option value="Online">Online</option>
        </select>
      </label>
      <label className="flex flex-col">
        Additional Info:
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="border p-2 rounded"
          rows={4}
        />
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
          onChange={(e) => setPctInstructorSynchronous(Number(e.target.value))}
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
          onChange={(e) => setPctInstructorAsynchronous(Number(e.target.value))}
          className="accent-blue-600"
        />
      </label>
      <button 
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}