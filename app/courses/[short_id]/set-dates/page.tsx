'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import AddNotification from "@/components/ui/notification-ribbon";

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
        .update({
          open_at: new Date(windowData.open_at).toISOString(),
          close_at: new Date(windowData.close_at).toISOString(),
        })
        .match({
          course_id: course.id,
          survey_n: survey_n
                });
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    router.push(`/courses/${short_id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Construct links.
  // For instructor, we assume an internal link to the instructor survey page.
  // For students, we use the Qualtrics link base.
  const qualtricsBase = "https://utexas.qualtrics.com/jfe/form/SV_b7PqMufNgIi0Jjo";
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <h2 className="text-lg font-semibold mb-4">Update Survey Dates</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        {[1, 2].map((survey_n) => (
          <div key={survey_n}>
            <div className="mb-4 border p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">Survey {survey_n}</h2>
              {survey_n === 1 && (
              <AddNotification 
                message="Select when you and your students will complete Survey 1. We recommend opening the survey after students receive their grades back from their first exam or major assignment and closing the survey approximately 1 week later."
                type="info" 
              />
            )}
            {survey_n === 2 && (
              <AddNotification 
                message="Select when you and your students will complete Survey 2. We recommend opening the survey near the last meeting time and closing the survey approximately 1 week later (at least a few days before finals)."
                type="info" 
              />
            )}

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
    </div>
  );
}