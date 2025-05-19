export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-5xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <a href="/" className="mt-6 text-blue-500 hover:underline">
        Return Home
      </a>
    </div>
  );
}