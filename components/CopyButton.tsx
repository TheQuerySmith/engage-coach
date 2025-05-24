'use client';

import {toast } from "react-toastify";

interface CopyButtonProps {
  copyText: string;
  buttonLabel?: string;
}

export default function CopyButton({ copyText, buttonLabel = "Click here to copy" }: CopyButtonProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    toast.success("Copied to clipboard!");
  };

  return (
    <button
      onClick={handleCopy}
      className="text-blue-600 hover:underline"
      title="Copy to clipboard"
    >
      {buttonLabel}
    </button>
  );
}