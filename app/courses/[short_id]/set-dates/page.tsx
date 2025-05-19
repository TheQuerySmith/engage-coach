'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function SetDatesPage() {
  const router = useRouter();
  const params = useParams();
  const { short_id } = params;
  const supabase = createClient();

  const [course, setCourse] = useState<any>(null);
  const [surveyWindows, setSurveyWindows] = useState<{ [key: number]: { open_at: string, close_at: string } }>({
    1: { open_at: '', close_at: '' },
    2: { open_at: '', close_at: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_survey_windows (
            survey_n,
            open_at,
            close_at
          )
        `)
        .eq('short_id', short_id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setCourse(data);

      // Initialize survey windows state from fetched data (if available)
      const initialWindows = { 1: { open_at: '', close_at: '' }, 2: { open_at: '', close_at: '' } };
      if (data.course_survey_windows) {
        data.course_survey_windows.forEach((w: any) => {
          if (w.survey_n === 1 || w.survey_n === 2) {
            initialWindows[w.survey_n] = {
              open_at: w.open_at ? new Date(w.open_at).toISOString().slice(0,16) : '',
              close_at: w.close_at ? new Date(w.close_at).toISOString().slice(0,16) : ''
            };
          }
        });
      }
      setSurveyWindows(initialWindows);
      setLoading(false);
    };

    fetchCourse();
  }, [short_id, router, supabase]);

  const handleChange = (survey_n: number, field: 'open_at' | 'close_at', value: string) => {
    setSurveyWindows(prev => ({
      ...prev,
      [survey_n]: {
        ...prev[survey_n],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/sign-in');
      return;
    }
    // For each survey number upsert a survey window record
    for (let survey_n of [1, 2]) {
      const windowData = surveyWindows[survey_n];
      // Note: Adjust the upsert fields as needed. Here we assume `survey_id` is unknown,
      // so we provide a dummy UUID. In your schema, you may determine the correct survey_id.
      const { error } = await supabase
        .from('course_survey_windows')
        .upsert({
          course_id: course.id,
          survey_n: survey_n,
          open_at: new Date(windowData.open_at).toISOString(),
          close_at: new Date(windowData.close_at).toISOString(),
          survey_id: course.survey_id || '00000000-0000-0000-0000-000000000000'
        }, { onConflict: 'course_id,survey_n' });
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    alert('Survey dates updated successfully!');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Construct links.
  // For instructor, we assume an internal link to the instructor survey page.
  // For students, we use the Qualtrics link base.
  const qualtricsBase = "https://utexas.qualtrics.com/jfe/form/SV_b7PqMufNgIi0Jjo";
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Set Survey Dates &amp; Get Survey Links for: {course.title}</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        {[1, 2].map((survey_n) => (
          <div key={survey_n} className="mb-4 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Survey {survey_n}</h2>
            <label className="block mb-2">
              Open At:
              <input 
                type="datetime-local"
                value={surveyWindows[survey_n]?.open_at || ''}
                onChange={(e) => handleChange(survey_n, 'open_at', e.target.value)}
                className="border p-2 rounded w-full"
              />
            </label>
            <label className="block mb-2">
              Close At:
              <input 
                type="datetime-local"
                value={surveyWindows[survey_n]?.close_at || ''}
                onChange={(e) => handleChange(survey_n, 'close_at', e.target.value)}
                className="border p-2 rounded w-full"
              />
            </label>
          </div>
        ))}
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Survey Dates'}
        </button>
      </form>

      <hr className="my-8" />

      <h2 className="text-xl font-bold mb-4">Survey Links</h2>
      {[1, 2].map((survey_n) => {
        // Instructor link: internal route (adjust as needed for your app)
        const instructorLink = `/surveys/instructor/${survey_n}?course_id=${course.id}`;
        // Student link: External Qualtrics URL with query parameters
        const studentLink = `${qualtricsBase}?course_id=${course.id}&survey_n=${survey_n}`;
        return (
          <div key={survey_n} className="mb-6">
            <h3 className="text-lg font-semibold">Survey {survey_n}</h3>
            <div className="flex flex-col gap-2">
              <div>
                <p className="font-medium">Instructor Survey Link:</p>
                <Link href={instructorLink} className="text-blue-600 hover:underline">
                  {instructorLink}
                </Link>
              </div>
              <div>
                <p className="font-medium">Student Survey Link:</p>
                <a href={studentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {studentLink}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}