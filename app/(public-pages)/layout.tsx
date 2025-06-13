import Breadcrumb from "@/components/ui/breadcrumb";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 max-w-7xl w-full mx-auto">
      {/* Main content area */}
      <div className="flex-1 p-5">
        <Breadcrumb />
        {children}
      </div>
    </div>
  );
}

