export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-10 px-4">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">About Our Project</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Origin</h2>
          <p className="text-lg mb-4">
            The CSE Project began in 2022 with support from the U.S. National Science Foundation (NSF Award #2201928). Our mission is to create the first scalable, student-report measure of STEM teaching practices so that instructors and researchers can see—with data—which classroom strategies truly foster engagement, persistence, and equity in undergraduate science and engineering courses. Over two-and-a-half years we refined the survey through four pilot studies, gathering more than 9,000 student responses and dozens of interviews across multiple institutions.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">An Unexpected Turn</h2>
          <p className="text-lg mb-4">
            In April 2025 the NSF terminated our award. Although disappointing, we decided this project was too important to stop. Bridge funding from the University of Texas at Austin and volunteer effort from the whole research team have kept the survey alive, while we pursue new support to finish the validation and broadly release the measure to instructors like you.
          </p>
        </section>
        <section>
          <p className="text-lg">
            You can learn more about our{" "}
            <a href="/team" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
              Team
            </a>{" "}
            and our{" "}
            <a href="/surveys" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
              Surveys
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}