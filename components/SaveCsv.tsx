'use client';

import React from 'react';

interface SaveToCsvButtonProps {
  data: { student_id: string; status: string }[];
  buttonText?: string;
}

export default function SaveToCsvButton({ data, buttonText }: SaveToCsvButtonProps) {
  const handleSaveToCsv = () => {
    // Create CSV header and rows.
    const headers = ['Student ID', 'Status'];
    const rows = data.map((row) => [row.student_id, row.status]);

    // Combine header and rows
    let csvContent = headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_responses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleSaveToCsv}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
    >
      {buttonText || 'Save to CSV'}
    </button>
  );
}