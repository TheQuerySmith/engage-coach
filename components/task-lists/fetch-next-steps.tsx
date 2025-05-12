import { TutorialStep } from "./tutorial-step";

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

export default function FetchNextSteps() {
  return (
    <ol className="flex flex-col gap-6">
      <TutorialStep title="Update your user profile">
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

      <TutorialStep title="Introduce yourself to the community" checked={true} >
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

      <TutorialStep title="Receive a free book!">
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

      <TutorialStep title="Check our our library of resources">
        <p>
          Some words here.
        </p>
      </TutorialStep>

      <TutorialStep title="Let the data flow!">
        <p>Your surveys are all set up! You can find survey links for yours studnets at this 
          page. On the date that you indicated, you can also complete this form (we will send 
          a reminder email on DATE). If you'd like to change your particpaiton dates, please click here.</p>
      </TutorialStep>
    </ol>
  );
}
