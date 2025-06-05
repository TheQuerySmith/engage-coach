export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center bg-background p-10">
      <div className="w-full max-w-lg p-6 bg-card rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
}