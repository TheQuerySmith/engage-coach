'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from "react-toastify";

// Shared UI components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CourseFormProps {
  onSuccess?: (message: string) => void;
  onMetaChange?: (info: { title: string; department: string; numberCode: string }) => void;
  initialCourse?: any;
}

export default function CourseForm({ onSuccess, onMetaChange, initialCourse }: CourseFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Course fields based on the schema
  const [title, setTitle] = useState(initialCourse?.title ?? '');
  const [department, setDepartment] = useState(initialCourse?.department ?? '');
  const [numberCode, setNumberCode] = useState(initialCourse?.number_code ?? '');
  const [nSections, setNSections] = useState(initialCourse?.n_sections ?? 1);
  const [nStudents, setNStudents] = useState(initialCourse?.n_students ?? 0);
  const [pctMajors, setPctMajors] = useState(initialCourse?.pct_majors ?? "");
  const [pctSTEM, setPctSTEM] = useState(initialCourse?.pct_stem ?? "");
  // New dropdown fields with "Other" defaults
  const [generalEducation, setGeneralEducation] = useState(initialCourse?.general_education ?? 'Unsure/Other');
  const [level, setLevel] = useState(initialCourse?.level ?? 'Other');
  const [courseType, setCourseType] = useState(initialCourse?.type ?? 'Lecture');
  const [format, setFormat] = useState(initialCourse?.format ?? 'In-Person');
  const [additionalInfo, setAdditionalInfo] = useState(initialCourse?.additional_info ?? '');
  const [pctInstructorDecision, setPctInstructorDecision] = useState(initialCourse?.pct_instructor_decision ?? "");
  const [pctInstructorSynchronous, setPctInstructorSynchronous] = useState(initialCourse?.pct_instructor_synchronous ?? "");
  const [pctInstructorAsynchronous, setPctInstructorAsynchronous] = useState(initialCourse?.pct_instructor_asynchronous ?? "");

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return title.trim() !== '' && department.trim() !== '' && numberCode.trim() !== '';
      case 2:
        return pctInstructorDecision !== "" && pctInstructorSynchronous !== "" && pctInstructorAsynchronous !== "";
      case 3:
        return nStudents > 0;
      case 4:
        return isStepComplete(1) && isStepComplete(2) && isStepComplete(3);
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Section {currentStep} of {totalSteps}</h2>
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const completed = isStepComplete(step);
            const isPast = step < currentStep;

            let classes = 'w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ';
            let label: React.ReactNode = step;

            if (step === currentStep) {
              classes += 'bg-primary text-primary-foreground';
            } else if (isPast && completed) {
              classes += 'bg-green-500 text-white';
              label = '✓';
            } else if (isPast && !completed) {
              classes += 'bg-red-500 text-white';
            } else {
              classes += 'bg-gray-200 text-gray-600 hover:bg-gray-300';
            }

            return (
              <button
                key={step}
                type="button"
                onClick={() => goToStep(step)}
                className={classes}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <fieldset className="space-y-6">
            <legend className="text-2xl font-semibold">Basic Information</legend>

            {/* Course Title */}
            <div className="flex items-center gap-4">
              <Label htmlFor="title">Informal Course Title:</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Organic Chemistry"
                className="max-w-80"
                required
              />
              <p className="text-sm text-muted-foreground">
                (How students refer to the course)
              </p>
            </div>

            {/* Department */}
            <div className="flex items-center gap-4">
              <Label htmlFor="department">Department:</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., CHEM"
                className="max-w-24"
              />
              <p className="text-sm text-muted-foreground">
                (2-5 letter department abbreviation)
              </p>
            </div>

            {/* Course Code */}
            <div className="flex items-center gap-4">
              <Label htmlFor="numberCode">Course Number:</Label>
              <Input
                id="numberCode"
                value={numberCode}
                onChange={(e) => setNumberCode(e.target.value)}
                placeholder="e.g., 101"
                className="max-w-20"
              />
            </div>

            {/* Sections */}
            <div className="flex items-center gap-4">
              <Label htmlFor="nSections">How many sections will you teach this term?</Label>
              <Input
                id="nSections"
                type="number"
                min="1"
                value={nSections}
                onChange={(e) => setNSections(Number(e.target.value))}
                className="max-w-20"
              />
            </div>

            {/* Type */}
            <div className="flex items-center gap-4">
                <Label htmlFor="courseType">What type of course is this? </Label>
                <select
                  id="courseType"
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="max-w-xs h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Seminar/Discussion">Seminar / Discussion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            {/* Format */}
            <div className="flex items-center gap-4">
              <Label htmlFor="format">How will students primarily engage with the course?</Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="max-w-xs h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </fieldset>
        );

      case 2:
        return (
          <fieldset className="space-y-6">
            <legend className="text-2xl font-semibold">Instructor Role</legend>

            <p className="text-sm text-muted-foreground">
              What percent of the following is led by <strong>you</strong> personally? (i.e., not TAs or other instructors)
            </p>

            {/* Instructor Decision Percentage */}
            <div className="space-y-1">
              <Label htmlFor="pctInstructorDecision">
                I am responsible for teaching decisions in the course (e.g., syllabi, content)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pctInstructorDecision"
                  type="number"
                  min="0"
                  max="100"
                  value={pctInstructorDecision}
                  onChange={(e) => setPctInstructorDecision(Number(e.target.value) || 0)}
                  placeholder="0-100"
                  className="max-w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* Synchronous Percentage */}
            <div className="space-y-1">
              <Label htmlFor="pctInstructorSynchronous">
                I am responsible for synchronous contact time (e.g., lecture, lab, office hours)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pctInstructorSynchronous"
                  type="number"
                  min="0"
                  max="100"
                  value={pctInstructorSynchronous}
                  onChange={(e) => setPctInstructorSynchronous(Number(e.target.value) || 0)}
                  placeholder="0-100"
                  className="max-w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* Asynchronous Percentage */}
            <div className="space-y-1">
              <Label htmlFor="pctInstructorAsynchronous">
                I am responsible for asynchronous contact time (e.g., recorded lectures, emails)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pctInstructorAsynchronous"
                  type="number"
                  min="0"
                  max="100"
                  value={pctInstructorAsynchronous}
                  onChange={(e) => setPctInstructorAsynchronous(Number(e.target.value) || 0)}
                  placeholder="0-100"
                  className="max-w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </fieldset>
        );

      case 3:
        return (
          <fieldset className="space-y-6">
            <legend className="text-2xl font-semibold">Student Population</legend>

            {/* Number of Students */}
            <div className="flex items-center gap-4">
              <Label htmlFor="nStudents">How many students are expected enroll across all sections?</Label>
              <Input
                id="nStudents"
                type="number"
                min="0"
                value={nStudents === 0 ? '' : nStudents}
                onChange={(e) => setNStudents(Number(e.target.value) || 0)}
                placeholder="0-9999"
                className="max-w-xs"
              />
            </div>

            {/* Percentage Majors */}
            <div className="flex items-center gap-4">
                <Label htmlFor="pctMajors">Approximately what percentage of students are majoring in {department || "the department"}</Label>
              <Input
                id="pctMajors"
                type="number"
                min="0"
                max="100"
                value={pctMajors}
                onChange={(e) => setPctMajors(Number(e.target.value) || 0)}
                placeholder="0-100"
                className="max-w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>

            {/* Percentage STEM */}
            <div className="flex items-center gap-4">
              <Label htmlFor="pctSTEM">Approximately what percentage of students are majoring in STEM (including {department || "the department"})</Label>
              <Input
                id="pctSTEM"
                type="number"
                min="0"
                max="100"
                value={pctSTEM}
                onChange={(e) => setPctSTEM(Number(e.target.value) || 0)}
                placeholder="0-100"
                className="max-w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>

            {/* General Education */}
            <div className="flex items-center gap-4">
                <Label htmlFor="generalEducation">Does this course fulfill a general education requirement?</Label>
              <select
                id="generalEducation"
                value={generalEducation}
                onChange={(e) => setGeneralEducation(e.target.value)}
                className="max-w-xs h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Unsure/Other">Unsure / Other</option>
              </select>
            </div>

            {/* Level */}
            <div className="flex items-center gap-4">
              <Label htmlFor="level">What is this typical population of this course?</Label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="max-w-xs h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Introductory Undergraduate">Introductory Undergraduate</option>
                <option value="Advanced Undergraduate">Advanced Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </fieldset>
        );

      case 4:
        return (
          <fieldset className="space-y-6">
            <legend className="text-2xl font-semibold">Additional Information</legend>

            <div className="space-y-1">
              <Label htmlFor="additionalInfo">Anything else that would be helpful for us to know about your course or students? (Optional)</Label>
              <textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </fieldset>
        );

      default:
        return null;
    }
  };

  const renderNavigation = () => (
    <div className="flex justify-between items-center mt-8 pt-6 border-t">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
        >
          Previous
        </Button>
      ) : <div style={{ width: '1px' }} />}

      <div className="flex space-x-2">
        {currentStep < totalSteps && (
          <Button
            key="next"
            type="button"
            onClick={nextStep}
            disabled={!isStepComplete(currentStep)}
          >
            Next
          </Button>
        )}

        {currentStep === totalSteps && (
          <Button
            key="submit"
            type="submit"
            disabled={!isStepComplete(4)}
          >
            {initialCourse ? 'Update Course' : 'Add Course'}
          </Button>
        )}
      </div>
    </div>
  );

  // Notify parent when core meta fields change
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({ title, department, numberCode });
    }
  }, [title, department, numberCode, onMetaChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission if on the last step and the submit button was used
    if (currentStep !== totalSteps) {
      return;
    }

    // Final step – proceed with actual submission
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      alert('User not authenticated');
      return;
    }

    let error, result;
    if (initialCourse && initialCourse.short_id) {
      // Update existing course
      const { error: updateError, data: updatedCourses } = await supabase
        .from('courses')
        .update({
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
        })
        .eq('short_id', initialCourse.short_id)
        .select('*');
      error = updateError;
      result = updatedCourses;
    } else {
      // Insert new course
      const { error: insertError, data: insertedCourses } = await supabase.from('courses').insert([
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
      ]).select('*');
      error = insertError;
      result = insertedCourses;
    }

    if (error) {
      alert(initialCourse ? ("Error updating course: " + error.message) : ("Error adding course: " + error.message));
    } else if (result && result.length > 0) {
      const course = result[0];
      if (initialCourse) {
        onSuccess && onSuccess("Course updated successfully!");
        router.push(`/courses/${course.short_id}`); // Redirect to course page after update
      } else {
        onSuccess && onSuccess("Course added successfully!");
        router.push(`/courses/${course.short_id}/set-dates`);
      }
    } else {
      console.error("No data returned from operation", result);
      alert(initialCourse ? "Course was updated, but could not retrieve course data." : "Course was added, but could not retrieve new course data.");
      router.push("/courses");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {renderStepIndicator()}
      {renderStepContent()}
      {renderNavigation()}
    </form>
  );
}