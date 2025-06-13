'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Breadcrumb() {
  const pathname = usePathname(); // e.g. "/courses/abc123/edit"
  const segments = pathname.split('/').filter(Boolean);
  const [courseName, setCourseName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // If we're under the "courses" route, the second segment is the course short_id.
    if (segments[0] === 'courses' && segments[1]) {
      const shortId = segments[1];
      (async () => {
        const { data, error } = await supabase
          .from('courses')
          .select('title')
          .eq('short_id', shortId)
          .single();
        if (!error && data) {
          setCourseName(data.title);
        }
      })();
    }
  }, [segments.join(), supabase]);

  let pathAccumulator = '';
  return (
    <nav aria-label="breadcrumb" className="mb-4 text-sm text-gray-600">
      <span>
        <Link href="/" className="hover:underline">
          Home
        </Link>
      </span>
      {segments.length > 0 && <span className="mx-2">&gt;</span>}
      {segments.map((segment, index) => {
        pathAccumulator += '/' + segment;
        const isLast = index === segments.length - 1;
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);
        // If we're at the course segment, replace the segment with the course title
        if (index === 1 && segments[0] === 'courses' && courseName) {
          label = courseName;
        }
        return (
          <span key={index}>
            {isLast ? (
              <span>{label}</span>
            ) : (
              <Link href={pathAccumulator} className="hover:underline">
                {label}
              </Link>
            )}
            {!isLast && <span className="mx-2">&gt;</span>}
          </span>
        );
      })}
    </nav>
  );
}