'use client';

interface AddNotificationProps {
  message: string;
  type: "info" | "success" | "error";
}

export default function AddNotification({ message, type }: AddNotificationProps) {
  let baseClasses = "p-4 rounded mb-4 border-l-4 shadow";
  let extraClasses = "";
  switch (type) {
    case "info":
      extraClasses = "border-blue-500 bg-blue-50 text-blue-900";
      break;
    case "success":
      extraClasses = "border-green-500 bg-green-50 text-green-900";
      break;
    case "error":
      extraClasses = "border-red-500 bg-red-50 text-red-900";
      break;
    default:
      break;
  }

  return (
    <div className={`${baseClasses} ${extraClasses}`}>
      <span className="block">{message}</span>
    </div>
  );
}