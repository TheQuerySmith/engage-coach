// app/profile/update/page.tsx
import { createClient } from "@/utils/supabase/server";
import { cookies }                         from 'next/headers'
import { Label }                           from '@/components/ui/label'
import { Input }                           from '@/components/ui/input'

export default async function ProfilePage() {
  const supabase = await createClient();
  // 1) get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return <p className="text-red-600">You must be signed in to view your profile.</p>
  }

  // 2) fetch profile row
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return <p className="text-red-600">Error loading profile: {profileError?.message}</p>
  }

  // 3) render all columns as read-only
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>ID</Label>
          <Input readOnly value={profile.id} />
        </div>
        <div>
          <Label>Email</Label>
          <Input readOnly value={profile.email} />
        </div>
        <div>
          <Label>Profile Name</Label>
          <Input readOnly value={profile.profile_name} />
        </div>
        <div>
          <Label>First Name</Label>
          <Input readOnly value={profile.first_name || ''} />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input readOnly value={profile.last_name || ''} />
        </div>
        <div>
          <Label>Job Title</Label>
          <Input readOnly value={profile.job_title || ''} />
        </div>
        <div>
          <Label>Department</Label>
          <Input readOnly value={profile.department || ''} />
        </div>
        <div>
          <Label>Institution</Label>
          <Input readOnly value={profile.institution || ''} />
        </div>
        <div>
          <Label>Role</Label>
          <Input readOnly value={profile.role} />
        </div>
        <div>
          <Label>Created At</Label>
          <Input readOnly value={new Date(profile.created_at).toLocaleString()} />
        </div>
        <div>
          <Label>Updated At</Label>
          <Input readOnly value={new Date(profile.updated_at).toLocaleString()} />
        </div>
        <div>
          <Label>User Edited?</Label>
          <Input readOnly value={profile.user_edited ? 'Yes' : 'No'} />
        </div>
        <div>
          <Label>Consent</Label>
          <Input readOnly value={profile.consent ? 'Yes' : 'No'} />
        </div>
      </div>
    </div>
  )
}
