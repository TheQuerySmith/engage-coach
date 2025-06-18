'use client';

import { useState } from 'react';
import CourseForm from './CourseForm';

export default function AddCoursePage() {
  const [successMessage, setSuccessMessage] = useState('');
  const [meta, setMeta] = useState<{ title: string; department: string; numberCode: string }>({ title: '', department: '', numberCode: '' });
  
  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-6">
      <h1 className="text-2xl font-bold">
        Add New Course:{ ' ' }
        {meta.title && (
          <span className="text-muted-foreground">
            {meta.title} ({meta.department} {meta.numberCode})
          </span>
        )}
      </h1>
      {successMessage && (
        <p className="text-green-600">{successMessage}</p>
      )}
      <CourseForm onSuccess={(msg) => setSuccessMessage(msg)} onMetaChange={setMeta} />
    </div>
  );
}