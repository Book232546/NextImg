import EditProfileForm from "@/components/ui/EditProfileForm"
import { getCurrentUser } from "@/lib/getCurrentUser"
import { redirect } from "next/navigation"
import "@/styles/profile.css"

export default async function EditProfilePage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/login")
  }

  return (
    <section className="profile-edit-shell">
      <div className="profile-shell__glow profile-shell__glow--left" />
      <div className="profile-shell__glow profile-shell__glow--right" />

      <div className="profile-edit-layout">
        <div className="profile-edit-panel">
          <EditProfileForm
            userId={currentUser.id}
            initialUsername={currentUser.username}
            initialBio={currentUser.bio ?? ""}
            initialImage={currentUser.image ?? ""}
          />
        </div>
      </div>
    </section>
  )
}
