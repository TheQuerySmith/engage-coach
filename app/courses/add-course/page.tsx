'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import CourseForm from './CourseForm';

export default function AddCoursePage() {
  const [successMessage, setSuccessMessage] = useState('');
  
  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-6">
      <h1 className="text-2xl font-bold">Add New Course</h1>
      {successMessage && (
        <p className="text-green-600">{successMessage}</p>
      )}
      <CourseForm onSuccess={(msg) => setSuccessMessage(msg)} />
    </div>
  );
}