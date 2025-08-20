export const dynamic = 'force-dynamic';

import Breadcrumb from "@/components/ui/breadcrumb";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/ui/sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 max-w-7xl w-full mx-auto">
      <Sidebar />
      {/* Main content area */}
      <div className="flex-1 p-5">
        <Breadcrumb />
        {children}
        <ToastContainer position="bottom-right" autoClose={1500} limit={3} />
      </div>
    </div>
  );
}

