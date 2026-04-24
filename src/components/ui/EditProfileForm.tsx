"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type EditProfileFormProps = {
  userId: string
  initialUsername: string
  initialBio: string
  initialImage: string
}

export default function EditProfileForm({
  userId,
  initialUsername,
  initialBio,
  initialImage,
}: EditProfileFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [image, setImage] = useState(initialImage)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const previewImage = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile)
    }

    return image || "/default-avatar.svg"
  }, [avatarFile, image])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("bio", bio)
      formData.append("image", image)

      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to update profile")
      }

      setImage(data.image ?? "")
      setAvatarFile(null)
      setSuccess("Profile updated successfully.")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <div>
        <span className="profile-edit-form__badge">Owner Only</span>
        <h1 className="profile-edit-form__title">Edit profile</h1>
        <p className="profile-edit-form__subtitle">
          Update your name, avatar, and bio. This screen is only available to the owner of the profile.
        </p>
      </div>

      {error && <div className="profile-edit-form__message profile-edit-form__message--error">{error}</div>}
      {success && <div className="profile-edit-form__message profile-edit-form__message--success">{success}</div>}

      <div className="profile-edit-form__avatar-block">
        <img src={previewImage} alt={username || "Profile preview"} className="profile-edit-form__avatar-preview" />

        <label className="profile-edit-form__field">
          <span className="profile-edit-form__label">Upload Avatar</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="profile-edit-form__input profile-edit-form__file"
          />
        </label>
      </div>

      <label className="profile-edit-form__field">
        <span className="profile-edit-form__label">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="profile-edit-form__input"
          placeholder="yourname"
        />
      </label>

      <label className="profile-edit-form__field">
        <span className="profile-edit-form__label">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="profile-edit-form__textarea"
          placeholder="Tell people a bit about your work."
        />
      </label>

      <div className="profile-edit-form__actions">
        <Link href={`/profile/${userId}`} className="profile-edit-form__cancel">
          Cancel
        </Link>
        <button type="submit" disabled={loading} className="profile-edit-form__submit">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
