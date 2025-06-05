"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function UploadStudentListPage() {
  const { short_id } = useParams();
  const router = useRouter();
  const [studentIdsText, setStudentIdsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [trackedStudents, setTrackedStudents] = useState<
    { student_id: string; canDelete: boolean }[]
  >([]);
  const [loadingTracked, setLoadingTracked] = useState(false);
  const [courseId, setCourseId] = useState<string>("");

  // Fetch tracked students for the course.
  useEffect(() => {
    async function fetchTrackedStudents() {
      setLoadingTracked(true);
      const supabase = createClient();
      // Fetch course record to get course id.
      const { data: courseRecord, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("short_id", short_id)
        .single();
      if (courseError || !courseRecord) {
        setLoadingTracked(false);
        return;
      }
      setCourseId(courseRecord.id);

      // Fetch all student survey responses for this course, including upload_source.
      const { data: studentsData, error: studentError } = await supabase
        .from("student_course_survey_responses")
        .select("student_id, upload_source")
        .eq("course_id", courseRecord.id);
      if (studentError || !studentsData) {
        setLoadingTracked(false);
        return;
      }
      // Group responses by student_id.
      // A student can be deleted only if every row for that student has upload_source === "Instructor".
      const uniqueStudentMap = new Map<string, { student_id: string; canDelete: boolean }>();
      studentsData.forEach((r: any) => {
        const sid = r.student_id;
        const isInstructor = r.upload_source === "Instructor";
        if (!uniqueStudentMap.has(sid)) {
          uniqueStudentMap.set(sid, { student_id: sid, canDelete: isInstructor });
        } else {
          const existing = uniqueStudentMap.get(sid)!;
          // If any row is not an instructor row, mark as non-deletable.
          if (!isInstructor) {
            existing.canDelete = false;
          }
        }
      });
      // Convert and sort alphabetically by student_id.
      const sortedStudents = Array.from(uniqueStudentMap.values()).sort((a, b) =>
        a.student_id.localeCompare(b.student_id)
      );
      setTrackedStudents(sortedStudents);
      setLoadingTracked(false);
    }
    fetchTrackedStudents();
  }, [short_id, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Parse student IDs: split by newline and remove blanks.
    const studentIds = studentIdsText
      .split(/\r?\n/)
      .map((id) => id.trim())
      .filter((id) => id !== "");

    if (studentIds.length === 0) {
      setMessage("Please enter at least one student ID.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch the course record by short_id to get its UUID.
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("short_id", short_id)
      .single();
    if (courseError || !courseData) {
      setMessage("Error fetching course data: " + courseError?.message);
      setLoading(false);
      return;
    }

    // Fetch the student survey record for "Student Course Survey 2025".
    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .select("id")
      .eq("name", "Student Course Survey 2025")
      .single();
    if (surveyError || !surveyData) {
      setMessage("Error fetching student survey record.");
      setLoading(false);
      return;
    }
    const studentSurveyId = surveyData.id;

    // Build rows for each student id for surveys 1 and 2.
    const rows = [];
    for (const survey_n of [1, 2]) {
      for (const student_id of studentIds) {
        rows.push({
          student_id, // provided student ID.
          course_id: courseData.id, // the course UUID.
          survey_id: studentSurveyId,
          survey_n,
          status: "Not Started",
          upload_source: "Instructor",
        });
      }
    }

    // Insert the rows into student_course_survey_responses.
    const { error: insertError } = await supabase
      .from("student_course_survey_responses")
      .insert(rows);

    if (insertError) {
      setMessage("Error uploading student list: " + insertError.message);
    } else {
      setMessage("Student list uploaded successfully!");
      setStudentIdsText("");
    }
    setLoading(false);
  };

  // Handler to delete an individual instructor-added student, only if eligible.
  const handleDelete = async (student_id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("student_course_survey_responses")
      .delete()
      .eq("course_id", courseId)
      .eq("student_id", student_id)
      .eq("upload_source", "Instructor");
    if (error) {
      setMessage("Error deleting student: " + error.message);
    } else {
      setMessage(`Removed ${student_id} successfully.`);
    }
  };

  // Handler to delete all manually added students (eligible ones only).
  const handleDeleteAll = async () => {
    const supabase = createClient();
    // Gather eligible student IDs (those added exclusively by Instructor).
    const eligibleStudentIds = trackedStudents
      .filter((s) => s.canDelete)
      .map((s) => s.student_id);
    if (eligibleStudentIds.length === 0) {
      setMessage("No eligible manually added students available for deletion.");
      return;
    }
    const { error } = await supabase
      .from("student_course_survey_responses")
      .delete()
      .eq("course_id", courseId)
      .eq("upload_source", "Instructor")
      .in("student_id", eligibleStudentIds);
    if (error) {
      setMessage("Error deleting manually added students: " + error.message);
    } else {
      setMessage("Deleted all manually added students.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Student List</h1>
      <p className="mb-4">
        Enter one student ID per line or paste a CSV list of student IDs. The IDs
        you enter will be added to your course’s student survey responses as
        "Not Started".
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={studentIdsText}
          onChange={(e) => setStudentIdsText(e.target.value)}
          rows={10}
          className="border p-2 rounded"
          placeholder="Enter student IDs, one per line"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Student List"}
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}

      <hr className="my-8" />

      <h2 className="text-xl font-bold mb-4">
        Tracked Students ({trackedStudents.length})
      </h2>
      {loadingTracked ? (
        <p>Loading tracked students...</p>
      ) : trackedStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trackedStudents.map((student) => (
            <div
              key={student.student_id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <span>{student.student_id}</span>
              {student.canDelete && (
                <button
                  onClick={() => handleDelete(student.student_id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Delete this student"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No students tracked yet.</p>
      )}

      <div className="flex items-center justify-begin mt-4">
        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete all manually added students
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Please note that you can only delete students who have not completed a
        survey to ensure student responses are not inadvertently deleted.
      </p>
    </div>
  );
}