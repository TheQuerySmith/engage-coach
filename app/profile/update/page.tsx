// app/profile/update/page.tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import UpdateForm from "./UpdateForm";
import UpdateProfileField from "./UpdateForm";


export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return <p className="text-red-600">You must be signed in to view your profile.</p>;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return <p className="text-red-600">Error loading profile: {profileError?.message}</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="flex justify-center text-2xl font-semibold mb-4">My Profile</h1>
      
      <div className="grid grid-cols-1 gap-4">

        <h2 className="text-2xl font-semibold mb-4">Public Profile</h2>

        <UpdateProfileField
          userId={user.id}
          column="profile_name"
          label="Profile Name"
          initialValue={profile.profile_name}
          placeholder="e.g., Eric Smith"
          note="This is the name that will be displayed when you participate in the community.
          We recommend using your real name unless you would prefer to stay anonymous."
        />
        <UpdateProfileField
          userId={user.id}
          column="department"
          label="Department"
          initialValue={profile.department}
          placeholder="e.g., Computer Science"
          />
       
        <h2 className="text-2xl font-semibold mb-4">Private Profile</h2>
        <p>Everything below is used for reports and only visible to our team</p>
        <UpdateProfileField
          userId={user.id}
          column="email"
          label="Email"
          initialValue={profile.email}
          placeholder="e.g., email@university.edu"
        />

        <UpdateProfileField
          userId={user.id}
          column="first_name"
          label="First Name"
          initialValue={profile.first_name}
          placeholder="e.g., Eric"
        />
        <UpdateProfileField
          userId={user.id}
          column="last_name"
          label="Last Name"
          initialValue={profile.last_name}
          placeholder="e.g., Smith"
        />
        <UpdateProfileField
          userId={user.id}
          column="job_title"
          label="Job Title"
          initialValue={profile.job_title}
          placeholder="e.g., Assistant Professor"
        />
        <UpdateProfileField
          userId={user.id}
          column="institution"
          label="Institution"
          initialValue={profile.institution}
          placeholder="e.g., UT Austin"
        />
      </div>

      <details className="mt-6 border rounded-md">
        <summary className="cursor-pointer px-4 py-2 font-medium bg-gray-100">
          Additional User Info (for support)
        </summary>
        <div className="grid grid-cols-1 gap-4 p-4">
          <div>
            <Label>ID</Label>
            <Input readOnly value={profile.id} />
          </div>
          <div>
            <Label>Role</Label>
            <Input readOnly value={profile.role} />
          </div>
          <div>
            <Label>Created At</Label>
            <Input
              readOnly
              value={new Date(profile.created_at).toLocaleString()}
            />
          </div>
          <div>
            <Label>Updated At</Label>
            <Input
              readOnly
              value={new Date(profile.updated_at).toLocaleString()}
            />
          </div>
          <div>
            <Label>User Edited?</Label>
            <Input readOnly value={profile.user_edited ? "Yes" : "No"} />
          </div>
          <div>
            <Label>Consent</Label>
            <Input readOnly value={profile.consent ? "Yes" : "No"} />
          </div>
        </div>
      </details>
    </div>
  );
}
