import Image from 'next/image';

export default function AboutPage() {
  const coreTeam = [
    {
      name: "Eric N. Smith, Ph.D.",
      role: "Principal Investigator",
      image: "/images/smith-headshot.jpg",
      bio: "Research associate in the Population Research Center at The University of Texas at Austin, specializing in motivation and measurement in higher‑education STEM."
    },
    {
      name: "Afiya Fredericks, Ph.D.",
      role: "Co‑Principal Investigator",
      image: "/images/fredericks-headshot.jpg",
      bio: "Assistant Professor at the University of the District of Columbia, expert in belonging and minoritized‑student success."
    },
    {
      name: "Kali Trzesniewski, Ph.D.",
      role: "Co‑Principal Investigator",
      image: "/images/trzesniewski-headshot.jpg",
      bio: "Associate Specialist in Cooperative Extension at the University of California, Davis, focusing on growth‑mindset research and teacher professional learning."
    },
    {
      name: "David Yeager, Ph.D.",
      role: "Co‑Principal Investigator",
      image: "/images/yeager-headshot.jpg",
      bio: "Associate Professor at The University of Texas at Austin; provides feedback and organizes data and support."
    }
  ];

  const supporters = [
    { name: "Sal Arellano", role: "Administrative Specialist" },
    { name: "Laquesha Barnes", role: "Research Assistant" },
    { name: "Brittnay Barrett", role: "Research Assistant" },
    { name: "Andrei Cimpian", role: "Advisory Board" },
    { name: "Shannon Green", role: "TxBSPI Executive Director" },
    { name: "Patrice Greene", role: "Postdoctoral Scholar" },
    { name: "Nirel JonesMitchell", role: "Research Assistant" },
    { name: "Sarah Leckey", role: "Postdoctoral Scholar" },
    { name: "Terri Matiella", role: "Collaborator" },
    { name: "Natassia Merrill", role: "Lead Designer" },
    { name: "Mary Murphy", role: "Advisory Board" },
    { name: "Barbara Schneider", role: "Advisory Board" },
    { name: "Marika Sigal", role: "PhD Student" },
    { name: "Megan Smith", role: "Lead Project Manager" },
    { name: "Stacy Sparks", role: "Co‑Investigator" },
    { name: "Santana Valenton", role: "PhD Student" },
    { name: "Monique Wright", role: "Research Assistant" }
  ];

  return (
    <div className="min-h-3/4 bg-background text-foreground flex items-center justify-center py-10 px-4">
      <div className="max-w-5xl">
        <code>This is a test page for the Engage Coach project.</code>
        
      <h2 className="text-4xl font-bold mb-6 text-center">Meet the Team</h2>
                <p className="text-xl mb-12">
                  Our work is powered by an interdisciplinary group of scholars, practitioners, and students who share a vision for supporting world-class STEM education for all students.
                </p>
        
                {/* Core Leadership */}
                <section>
                  <h3 className="text-3xl font-bold mb-8 text-center">Core Leadership</h3>
                  <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {coreTeam.map((member) => (
                        <div
                        key={member.name}
                        className="bg-card rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
                        >
                        <Image
                          src={member.image}
                          alt={`${member.name} headshot`}
                          width={128}
                          height={128}
                          className="rounded-full object-cover mb-4"
                        />
                        <h3 className="text-xl font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        <p className="text-sm leading-relaxed">{member.bio}</p>
                        </div>
                    ))}
                  </div>
                </section>
        
                {/* Additional Contributors */}
                <section className="mt-16">
                  <h2 className="text-3xl font-bold mb-4 text-center">Project Contributors</h2>
                  <ul className="mx-auto max-w-3xl space-y-2 text-center">
                    {supporters.map((supporter) => (
                      <li key={supporter.name} className="text-lg">
                        {supporter.name} <span className="text-muted-foreground">({supporter.role})</span>
                      </li>
                    ))}
                  </ul>
                </section>
          <h1 className="text-4xl font-bold mt-12 mb-6 text-center">About Our Project</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Our Origin</h2>
          <p className="text-lg mb-4">
            This program began in 2022 with support from the U.S. National Science Foundation (NSF Award #2201928). Our mission is to create the first scalable, student-report measure of STEM teaching practices so that instructors and researchers can see—with data—which classroom strategies truly foster engagement, persistence, and equity in undergraduate STEM courses. Over two-and-a-half years we refined the survey through four pilot studies, gathering more than 9,000 student responses and dozens of interviews across multiple institutions.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">An Unexpected Turn</h2>
          <p className="text-lg mb-4">
            In April 2025, our award was terminated by NSF. Although disappointing, we decided this project was too important to stop. Bridge funding from the University of Texas at Austin and volunteer effort from the whole research team have kept the survey alive, while we pursue new support to finish the validation and broadly release the measure to instructors like you.
          </p>
        </section>
        

        

        <h2 className="text-4xl font-bold mt-12 mb-6 text-center">About The Surveys</h2>
        <p>We will put more information here shortly</p>
      </div>
    </div>
    
  );
}