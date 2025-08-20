import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 p-5 min-h-screen">
      <nav className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/courses"
          className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Courses and Surveys
        </Link>
        <Link
          href="/profile"
          className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Profile
        </Link>
      </nav>
    </aside>
  );
}