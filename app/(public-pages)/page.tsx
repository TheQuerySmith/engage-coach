import { ChartBarIcon, AcademicCapIcon, BookOpenIcon, UserGroupIcon } from "@heroicons/react/24/solid";

export default async function Home() {
  return (
    <div className="min-h-3/4 flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
          Understand Your Students—Transform Your Classroom
        </h1>
        <div className="w-60 h-1 bg-blue-500 mx-auto mb-6"></div>
        <p className="text-lg text-foreground mb-8">
          Join a national community of college STEM instructors and gain actionable insights, expert coaching, and exclusive resources that spark student engagement.
        </p>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What You’ll Gain</h2>
          <ul className="mx-auto max-w-lg text-left space-y-4">
            <li className="flex items-start space-x-3">
              <ChartBarIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
              <span className="text-lg text-foreground">
                Custom student engagement reports powered by AI.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <AcademicCapIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
              <span className="text-lg text-foreground">
                Personalized coaching and presentations from experts.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <BookOpenIcon className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <span className="text-lg text-foreground">
                Exclusive resources and proven teaching strategies.
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <UserGroupIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
              <span className="text-lg text-foreground">
                A national network of innovative collaborators.
              </span>
            </li>
          </ul>
        </div>
        <div className="text-xl text-foreground font-semibold mb-8">
          <p>Spots are limited—don't miss out!</p>
        </div>
        <div>
          <a
            href="/sign-up"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg text-xl"
          >
            Get Started – Sign Up
          </a>
        </div>
        <div className="mt-6">
          <p className="text-lg">
            Want to learn more?{" "}
            <a href="/about" className="text-blue-500 hover:underline">
              Visit our About page
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}