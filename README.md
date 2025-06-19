# Instructor Survey Platform

A full-stack web application to streamline the administration, delivery, and reporting of student surveys for college instructors. Built using **Next.js**, **Supabase**, and **Qualtrics**, , the platform allows instructors to create accounts, launch surveys, and receive reports, while giving internal team members administrative oversight and automation tools.

---

## 🚀 Goals / Milestones

- Instructors can:

| Milestone | Description | Status |
|----------|-------------|--------|
| ✅ Profile | Update profile upon signup | Done |
| ✅ Courses | Create and view courses | Done |
| ✅ Surveys | View surveys and participant reports | Done |
| ✅ Dashboard | View survey status and next steps | In Progress |
| [ ] Reporting | Generate and download reports | Not Started |
| [ ] Notifications | Receive email notifications for survey updates | Not Started |
| [ ] Community | Access community, resources, and book | Not Started |

- Internal team members can:
| Milestone | Description | Status |
|----------|-------------|--------|
| [ ] Admin Dashboard | View and manage all users, courses, and surveys | Not Started |
| [ ] Mimic User | Impersonate any user for support | Not Started |
| [ ] Notifications | Send notifications to users | Not Started |
| [ ] Reporting | Generate and download reports for all users | Not Started |
- [ ] Documentation | View documentation and user support | Not Started |

 ### Improve features
 - [ ] If courses are deleted, change to inactive rather than delete
 - [ ] Currently set up for only two survey window: need to drastically update database etc. to allow for multiple survey windows
 - [ ] Added shortcut of adding 8 weeks to second survey window defaults within supabase function
 - [ ] Pre-course Survey
 - [ ] Add cslx to steps for conditional formatting?
 - [ ] Refresh survey pages (see PageRefresh.tsx) to update survey status
 - [ ] Limit Participant lists to 10 per page with pagination
 - [ ] User can upload a profile picture, bio, and links (social media, personal website, etc.)
 - [ ] Create linked instructors in a community page
 - [ ] clsx to highlight path route: https://nextjs.org/learn/dashboard-app/navigating-between-pages
 - [ ] Add warnings on invalid sign-in credentials
 - [ ] Make dashboard available when signed in
 - [ ] Add search to student ids
 - [ ] Update course form to use Form component (https://nextjs.org/learn/dashboard-app/mutating-data) and errors (https://nextjs.org/learn/dashboard-app/improving-accessibility)
 - [ ] Add error.tsx pages on unexpected errors
 - [ ] Parse our redundant code in create and edit course


### Bug Fixes
- [ ] Toast messages don't leave the screen on profile update
- [ ] Email address should be validated on profile update
- [ ] Add supabase error handling 
- [ ] Update email doesn't update auth.users table
- [ ] More efficient subcomponents? (e.g., redirect within fetch-next-steps.tsx)
- [ ] middleware.ts should redirect to signin if not logged in (not just profile)
- [ ] Ensure users can't change their profile.id or other locked fields
- [ ] Trim and lowercase student ids for better matching
- [ ] Ensure non-overlapping survey windows
- [ ] Default survey open/close at midnight of local time
- [ ] Create and edit courses should have explaination and correct dropdowns
- [ ] RLS policies (user_ulpoads, user_reports, discussion_signups) need RLS policies
- [ ] Need to validate course variables on creation

### Refactoring
- [ ] Remove unnessary effects

### Decisions
- [X] Do not store qualtrics survey data in the database; only whether the survey has been completed. This ensures that we are not duplicating data and that we are not storing sensitive information in our database.
- [X] Reports should be generated locally allowing for team review and approval before being sent to instructors. Also simplifies data management. Instead, R script that uses public API to update report links and saves to file system.
- [ ] Do we need overall instructor survey and course-specific?


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
  consent boolean
);

##### To make a checklist of user information

create table courses (
  id uuid primary key default gen_random_uuid(),
  short_id text unique not null default substring(md5(random()::text), 1, 6),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'My Course Title',
  created_at timestamp with time zone default now(),
  department text default 'My Department', -- get from profile.department
  number_code text,
  n_sections int default 1,
  n_students int,
  pct_majors int,
  pct_STEM int,
  general_education text check (general_education IN ('Yes','No','Unsure/Other')),
  level text check (level IN ('Introductory Undergrade','Advanced Undergraduate','Graduate','Other')),
  type text default 'Lecture' check (type IN ('Lecture','Lab','Seminar/Discussion','Other')),
  format text default 'In-Person' check (format IN ('In-Person','Online','Hybrid','Other')),
  additional_info text,
  pct_instructor_decision int,
  pct_instructor_synchronous int,
  pct_instructor_asynchronous int,
  is_active boolean default true
);

create table surveys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  link text not null,
  type text not null check (type IN ('Instructor','Student')),
  start_date date default now(),
  end_date date default now() + interval '6 month', 
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table instructor_survey_responses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references profiles(id) on delete cascade,
  survey_id uuid not null references surveys(id) on delete cascade,
  survey_n int not null,
  status text not null default 'Not Started' check (status IN ('Not Started','In Progress','Completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table instructor_course_survey_responses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  survey_id uuid not null references surveys(id) on delete cascade,
  survey_n int not null,
  status text not null default 'Not Started' check (status IN ('Not Started','In Progress','Completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table student_course_survey_responses (
  id uuid primary key default gen_random_uuid(),
  student_id text not null default 'anonymous',
  course_id uuid not null references courses(id) on delete cascade,
  survey_id uuid not null references surveys(id) on delete cascade,
  survey_n int not null,
  status text not null default 'Not Started' check (status IN ('Not Started','In Progress','Completed')),
  upload_source text not null default 'Survey' check (source IN ('Survey','Instructor')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- When a particular survey is available in a particular course
create table course_survey_windows (
  id           bigserial primary key,
  course_id    uuid  not null
               references courses(id) on delete cascade,
  survey_id    uuid  not null
               references surveys(id) on delete cascade,
  survey_n     int   not null,                       -- 1, 2, 3 … per course
  open_at      timestamptz not null,
  close_at     timestamptz not null,
  constraint chk_window  check (open_at < close_at),

  -- Keep the same survey from being scheduled twice for the same “N”
  unique (course_id, survey_n, survey_id)
);

-- Fast look-ups for “what’s open right now?”
create index on course_survey_windows (course_id, open_at, close_at);
create index on course_survey_windows (survey_id, open_at, close_at);




-- 2.1  All instructor-owned uploads (grades, recordings, future asset types)
create table user_uploads (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  course_id        uuid not null references courses(id) on delete cascade,
  file_type        text not null check (file_type in ('grade_csv','recording_mp4','recording_mkv')),
  supabase_path    text not null,             -- e.g. storage bucket key
  uploaded_at      timestamptz default now(),
  -- soft-delete so you never lose the audit trail
  is_deleted       boolean default false
);
create index on user_uploads (user_id, course_id, file_type) where is_deleted = false;

-- 2.2  Latest and historical PDF/HTML reports
create table user_reports (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  course_id        uuid not null references courses(id) on delete cascade,
  survey_n         int  not null check (survey_n in (1,2)),
  supabase_path    text not null,
  generated_at     timestamptz default now()
);
-- quick lookup of "latest" report
create unique index latest_report_per_survey
  on user_reports (course_id, survey_n, generated_at desc);

-- 2.3  Discussion sign-up vs opt-out
create type discussion_status as enum ('signed_up','opt_out','undecided');
create table discussion_signups (
  user_id          uuid primary key references profiles(id) on delete cascade,
  survey_n         int  not null check (survey_n in (1,2)),
  status           discussion_status not null default 'undecided',
  updated_at       timestamptz default now()
);

-- 2.4  App settings table (easy to find)
create table app_settings (
  key   text primary key,
  value int not null
);

insert into app_settings (key,value) values
  ('min_student_responses', 12),
  ('min_recordings_per_course', 2);



-- NOTE: Need to allow NULL values on level/type/format: 
-- e.g., format IS NULL OR format = ANY (ARRAY['In-Person'::text, 'Online'::text, 'Hybrid'::text, 'Other'::text])


### Dashboard brainstorming

1) Did the user update their profile? (profile.user_edited == T; never changes back)
2) Did the user set up a course? (courses table includes user_id and is_active = T)
3) Did the user confirm dates for survey?  (checklist_items.name ="confirm_dates" : where relevant user_checklist for user_id is true; changes back if another course is added)
4) Did the user choose consent to research? (profile.consent is not null (T or F))
5) For each survey (1:2):
5a) Did the instructor complete the survey? (instructor_course_survey_responses.instructor_id exists for course_id & status = 'Completed' & survey_n = [1:2])
5b) Did at least 12 students complete the survey? (count of student_course_survey_responses.course_id & survey_n = [1:2] & status = "Completed"
5c) Does that survey reports exist? (Need to create a new database that tracks reports that can be linked to each user)
5d): Has the user signed up to discuss reports or opted out? (checklist_items.name ="discussion_signup_[1:2]" : where relevant user_checklist for user_id is true;
6): Has the user uploaded grade data for every active course?
7): Has the user uploaded two course recording files? (Need new way to track this)