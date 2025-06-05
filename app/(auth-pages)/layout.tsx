export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="min-h-screen p-5">{children}</main>
      </body>
    </html>
  );
}