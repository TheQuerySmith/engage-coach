import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <p className="text-red-600">
        You must be signed in to view your profile.
      </p>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <p className="text-red-600">
        Error loading profile: {profileError?.message}
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
      <Link
          href="/profile/update"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md"
        >
          Update Profile
        </Link>
      <div className="space-y-1">
        <div>
          <strong>Profile Name:</strong> {profile.profile_name}
        </div>
        <div>
          <strong>Email:</strong> {profile.email}
        </div>
        <div>
          <strong>First Name:</strong> {profile.first_name || "N/A"}
        </div>
        <div>
          <strong>Last Name:</strong> {profile.last_name || "N/A"}
        </div>
        <div>
          <strong>Department:</strong> {profile.department || "N/A"}
        </div>
        <div>
          <strong>Institution:</strong> {profile.institution || "N/A"}
        </div>
        <div>
          <strong>Job Title:</strong> {profile.job_title || "N/A"}
        </div>
      </div>
    </div>
  );
}