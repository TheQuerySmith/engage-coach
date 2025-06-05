import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 p-5">
      <nav className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="text-gray-700 hover:text-blue-600"
        >
          Dashboard
        </Link>
        <Link
          href="/courses"
          className="text-gray-700 hover:text-blue-600"
        >
          Courses and Surveys
        </Link>
        <Link
          href="/profile"
          className="text-gray-700 hover:text-blue-600"
        >
          Profile
        </Link>
      </nav>
    </aside>
  );
}