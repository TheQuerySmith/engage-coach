import { createClient } from '@/utils/supabase/server'
import { TutorialStep } from "./tutorial-step";
import { redirect } from "next/navigation";

const create = `create table notes (
  id bigserial primary key,
  title text
);

insert into notes(title)
values
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');
`.trim();

const server = `import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select()

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
`.trim();

const client = `'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [notes, setNotes] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from('notes').select()
      setNotes(data)
    }
    getData()
  }, [])

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
`.trim();

export default async function FetchNextSteps() {
const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: entries, error: fetchError } = await supabase
    .from('user_checklist')
    .select('completed, checklist_items(name)')
    .eq('user_id', user.id)

  if (fetchError) {
    console.error(fetchError)
    return <p className="text-center text-red-600 p-6">Failed to load your checklist.</p>
  }

  const completedMap = new Map(
    entries.map((e) => [e.checklist_items.name, e.completed])
  )

  console.log(' 🔍 checklist entries:', entries)
  console.log(
    ' ✅ completedMap:',
    Array.from(new Map(entries.map(e => [e.checklist_items.name, e.completed])))
  )
  console.log(completedMap.get("updated_user_profile"))


  return (
    <ol className="flex flex-col gap-6">
      <TutorialStep title="Update your user profile" checked={completedMap.get("updated_user_profile") ?? false}>
        <p>
          Head over to the{" "}
          <a
            href="./profile/update"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            Profile Update Page
          </a>{" "}
          to update your profile. Only your profile name and department will be visible
          to other users. Everything else is private and only visible to our team. After
          you update your profile, this item will be marked as complete.
        </p>
      </TutorialStep>

      <TutorialStep title="Introduce yourself to the community" checked={completedMap.get("posted_community") ?? false} >
        <p>
          Head over to the{" "}
          <a
            href="./community"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            Community Page
          </a>{" "}
          to share an instructional win or learn what others are doing. After you post,
          like, or comment, this item will be marked as complete.
        </p>
      </TutorialStep>

      <TutorialStep title="Receive a free book!" checked={completedMap.get("completed_book_signup") ?? false}>
        <p>
          Please indicate if you are interested in getting a free copy of Dr. David Yeager's book <em>10 to 25: 
          The Science of Motivating Young People</em>, by filling out the {" "}
          <a
            href="./resources/10-to-25"
            className="font-bold hover:underline text-foreground/80"
            target="_blank"
            rel="noreferrer"
          >
            Book Request Form
          </a>
          , or indicate you do not want to receive a book.
        </p>
      </TutorialStep>

      <TutorialStep title="Check our our library of resources" checked={completedMap.get("clicked_library") ?? false}>
        <p>
          Some words here.
        </p>
      </TutorialStep>


      <TutorialStep title="Send out student surveys" checked={completedMap.get("student_surveys") ?? false}>
        <p>Your surveys are all set up! You can find survey links for yours studnets at this 
          page. On the date that you indicated, you can also complete this form (we will send 
          a reminder email on DATE). If you'd like to change your particpaiton dates, please click here.</p>
      </TutorialStep>

      <TutorialStep title="Complete instructor surveys" checked={completedMap.get("instructor_surveys") ?? false}>
        <p>Your surveys are all set up! You can find survey links for yours studnets at this
          page. On the date that you indicated, you can also complete this form (we will send
          a reminder email on DATE). If you'd like to change your particpaiton dates, please click here.</p>
      </TutorialStep>
    </ol>
  );
}
