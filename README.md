# Instructor Survey Platform

A full-stack web application to streamline the administration, delivery, and reporting of student surveys for college instructors. Built using **Next.js**, **Supabase**, and **Qualtrics**, , the platform allows instructors to create accounts, launch surveys, and receive reports, while giving internal team members administrative oversight and automation tools.

---

## 🚀 Goals / Milestones

- Instructors can:

| Milestone | Description | Status |
|----------|-------------|--------|
| ✅ Profile | Update profile upon signup | In Progress |


### 🛠️ Detailed Next steps
 - [/] Create a profile page with next steps (upon signup) 

 ### Optional features
 - [ ] User can upload a profile picture
 - [ ] User can upload a Bio  
 - [ ] User can upload a list of website links (social media, personal website, etc.)


### Bug Fixes
- [X] Fix the auto email linking
- [ ] Toast messages don't leave the screen on profile update
- [ ] Email address should be validated on profile update
- [ ] Add supabase error handling 
- [ ] Update email doesn't update auth.users table
- [ ] Need to create user_checklist row when user is created
- [ ] More efficient subcomponents? (e.g., redirect within fetch-next-steps.tsx)
- [ ] middleware.ts should redirect to signin if not logged in (not just profile)

### Profile Schema

Extends `auth.users` with additional fields for instructor profiles. The `user_id` column is a foreign key reference to the `auth.users` table, which is created by Supabase.

Optional columns are required for the profile to be considered complete. The `profile_name` column is a unique identifier for the instructor's profile and is generated using a random word generator if not provided. The `user_edited` column tracks whether the profile has been updated by the user, and the `consent` column indicates whether the user has consented to research.

For roles, `member` is the default role for sign-ups that allows them to access all features of the platform. The `admin` role is reserved for internal team members and has additional privileges. The `lead` role is for instructors who have been designated as leads for a specific course or program that have the ability to invite others and see their reports. The `basic` role is for a future feature that allows instructors to use surveys but with limited reporting.

| column        | type | nullable | notes |
|---------------|------|----------|-------|
| `user_id` **PK** | `uuid` | no | **FK → auth.users.id** |
| `email` | `text` | no | **FK → auth.users.email** |
| `profile_name` | `text` | no | Display name; has to be unique; defaults random words|
| `first_name`   | `text` | yes | Optional |
| `last_name`    | `text` | yes | Optional |
| `job_title` | `text` | yes | Optional |
| `department` | `text` | yes | Optional |
| `institution` | `text` | yes | Optional |
| `role` | `text` | no | `'basic' ∣ 'member' 'lead' ∣ 'admin'` (default `instructor`) |
| `user_edited` | `boolean` | no | Has this profile ever been updated? (default `false`) |
| `consent` | `boolean` | no | Consent to research (default `false`) |

#### SQL Tables
create table profiles (
  id uuid primary key references auth.users(id),
  email text not null default 'error@error.com',
  profile_name text not null unique default random_profile(),
  first_name text,
  last_name text,
  job_title text,
  department text,
  institution text,
  role text default 'member' check (role IN ('basic','member','lead','admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_edited boolean default false,
  consent boolean default false
);

##### To make a checklist of user information

create table checklist_items (
  id   serial primary key,
  name text not null unique,
  description text
);

-- link each user → each item, with a boolean flag
create table user_checklist (
  user_id           uuid  references auth.users(id) on delete cascade,
  checklist_item_id int   references checklist_items(id) on delete cascade,
  completed         boolean not null default false,
  completed_at      timestamptz,
  primary key (user_id, checklist_item_id)
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  short_id text unique not null default substring(md5(random()::text), 1, 5),
  instructor_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'My Course Title',
  created_at timestamp with time zone default now(),
  department text default 'My Department', -- get from profile.department
  number_code text,
  n_sections int default 1,
  n_students int,
  pct_majors int,
  pct_STEM int,
  general_education text check (general_education IN ('Yes','No','Unsure/Other')),
  level text check (level IN ('Introductory Undergrade','Advanced Undergraduate','Graduate')),
  type text default 'Lecture' check (type IN ('Lecture','Lab','Seminar/Discussion','Other')),
  format text default 'In-Person' check (format IN ('In-Person','Online','Hybrid','Other')),
  additional_info text,
  pct_instructor_decision int,
  pct_instructor_synchronous int,
  pct_instructor_asynchronous int
);

-- NOTE: Need to allow NULL values on level/type/format: 
-- e.g., format IS NULL OR format = ANY (ARRAY['In-Person'::text, 'Online'::text, 'Hybrid'::text, 'Other'::text])





SQL Functions


Trigger profiles_sync_email BEFORE INSTERT on profiles (ROW)

```sql
BEGIN
  -- Only overwrite if email was not explicitly provided
  IF NEW.email IS NULL OR NEW.email = '' OR NEW.email = 'error@error.com' THEN
    SELECT auth.users.email
      INTO NEW.email
      FROM auth.users
     WHERE auth.users.id = NEW.id;
  END IF;

  RETURN NEW;
END;
```

Called on every insert to the profiles table. 
```sql
DECLARE
  hex_part text;
BEGIN
  -- Generate an 8-character hex string from a random number’s MD5 hash
  hex_part := substr(md5(random()::text), 1, 8);
  
  -- Prefix with whatever label you like (e.g., "member_" instead of "instructor_")
  RETURN 'member_' || hex_part;
END;


