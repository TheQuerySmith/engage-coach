'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname(); // e.g. "/dashboard/courses/123/edit"
  const segments = pathname.split('/').filter(Boolean);

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
        // Optionally, format the segment (capitalize, replace dashes) as needed.
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
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