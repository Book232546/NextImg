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
            initialBirthDate={currentUser.birthDate ? new Date(currentUser.birthDate).toISOString().slice(0, 10) : ""}
            initialGender={currentUser.gender ?? "PREFER_NOT_TO_SAY"}
            initialCountry={currentUser.country ?? ""}
            initialShowBirthDate={currentUser.showBirthDate ?? true}
            initialShowGender={currentUser.showGender ?? true}
            initialShowCountry={currentUser.showCountry ?? true}
            initialProfileLinks={currentUser.profileLinks}
          />
        </div>
      </div>
    </section>
  )
}
