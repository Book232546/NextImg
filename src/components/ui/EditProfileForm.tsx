"use client"

import { COUNTRIES, GENDER_OPTIONS } from "@/lib/countries"
import type { ProfileLink, ProfileLinkPlatform } from "@/lib/userProfile"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type EditableProfileLink = {
  id: string
  platform: ProfileLinkPlatform
  label: string
  url: string
}

type EditProfileFormProps = {
  userId: string
  initialUsername: string
  initialBio: string
  initialImage: string
  initialBirthDate: string
  initialGender: string
  initialCountry: string
  initialShowBirthDate: boolean
  initialShowGender: boolean
  initialShowCountry: boolean
  initialProfileLinks: ProfileLink[]
}

const PLATFORM_OPTIONS: Array<{ value: ProfileLinkPlatform; label: string; placeholder: string }> = [
  { value: "FACEBOOK", label: "Facebook", placeholder: "facebook.com/your-page" },
  { value: "INSTAGRAM", label: "Instagram", placeholder: "instagram.com/your-handle" },
  { value: "X", label: "X", placeholder: "x.com/your-handle" },
  { value: "PATREON", label: "Patreon", placeholder: "patreon.com/your-name" },
  { value: "KOFI", label: "Ko-fi", placeholder: "ko-fi.com/your-name" },
  { value: "OTHER", label: "Other", placeholder: "example.com/contact" },
]

function createEmptyLink(): EditableProfileLink {
  return {
    id: crypto.randomUUID(),
    platform: "FACEBOOK",
    label: "",
    url: "",
  }
}

function toEditableLink(link: ProfileLink): EditableProfileLink {
  return {
    id: link.id,
    platform: link.platform,
    label: link.label ?? "",
    url: link.url,
  }
}

export default function EditProfileForm({
  userId,
  initialUsername,
  initialBio,
  initialImage,
  initialBirthDate,
  initialGender,
  initialCountry,
  initialShowBirthDate,
  initialShowGender,
  initialShowCountry,
  initialProfileLinks,
}: EditProfileFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [image, setImage] = useState(initialImage)
  const [birthDate, setBirthDate] = useState(initialBirthDate)
  const [gender, setGender] = useState(initialGender || "PREFER_NOT_TO_SAY")
  const [country, setCountry] = useState(initialCountry)
  const [showBirthDate, setShowBirthDate] = useState(Boolean(initialShowBirthDate))
  const [showGender, setShowGender] = useState(Boolean(initialShowGender))
  const [showCountry, setShowCountry] = useState(Boolean(initialShowCountry))
  const [profileLinks, setProfileLinks] = useState<EditableProfileLink[]>(
    initialProfileLinks.map(toEditableLink)
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const previewImage = useMemo(() => {
    return previewUrl || image || "/default-avatar.svg"
  }, [previewUrl, image])

  const handleProfileLinkChange = (
    linkId: string,
    field: keyof Omit<EditableProfileLink, "id">,
    value: string
  ) => {
    setProfileLinks((current) =>
      current.map((link) => (link.id === linkId ? { ...link, [field]: value } : link))
    )
  }

  const addProfileLink = () => {
    setProfileLinks((current) => [...current, createEmptyLink()])
  }

  const removeProfileLink = (linkId: string) => {
    setProfileLinks((current) => current.filter((link) => link.id !== linkId))
  }

  const handleAvatarChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setAvatarFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("bio", bio)
      formData.append("image", image)
      formData.append("birthDate", birthDate)
      formData.append("gender", gender)
      formData.append("country", country)
      formData.append("showBirthDate", String(showBirthDate))
      formData.append("showGender", String(showGender))
      formData.append("showCountry", String(showCountry))
      formData.append(
        "profileLinks",
        JSON.stringify(
          profileLinks.map((link) => ({
            platform: link.platform,
            label: link.label,
            url: link.url,
          }))
        )
      )

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
      handleAvatarChange(null)
      router.push(`/profile/${userId}`)
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
          Update your profile details and choose which personal information other people are allowed to see.
        </p>
      </div>

      {error && <div className="profile-edit-form__message profile-edit-form__message--error">{error}</div>}

      <div className="profile-edit-form__avatar-block">
        <img src={previewImage} alt={username || "Profile preview"} className="profile-edit-form__avatar-preview" />

        <label className="profile-edit-form__field">
          <span className="profile-edit-form__label">Upload Avatar</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
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

      <div className="profile-edit-form__section">
        <p className="profile-edit-form__section-title">Social and Donate Links</p>
        <p className="profile-edit-form__section-subtitle">
          Add the places where people can follow your work, contact you, or support you directly.
        </p>
      </div>

      <div className="profile-edit-form__link-list">
        {profileLinks.length === 0 && (
          <div className="profile-edit-form__link-empty">
            No links yet. Add Facebook, Instagram, X, Patreon, Ko-fi, or any custom link.
          </div>
        )}

        {profileLinks.map((link) => {
          const selectedPlatform =
            PLATFORM_OPTIONS.find((option) => option.value === link.platform) ?? PLATFORM_OPTIONS[0]

          return (
            <div key={link.id} className="profile-edit-form__link-card">
              <div className="profile-edit-form__link-grid">
                <label className="profile-edit-form__field">
                  <span className="profile-edit-form__label">Platform</span>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      handleProfileLinkChange(link.id, "platform", e.target.value as ProfileLinkPlatform)
                    }
                    className="profile-edit-form__input profile-edit-form__select"
                  >
                    {PLATFORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="profile-edit-form__field">
                  <span className="profile-edit-form__label">URL</span>
                  <input
                    value={link.url}
                    onChange={(e) => handleProfileLinkChange(link.id, "url", e.target.value)}
                    className="profile-edit-form__input"
                    placeholder={selectedPlatform.placeholder}
                  />
                </label>
              </div>

              {link.platform === "OTHER" && (
                <label className="profile-edit-form__field">
                  <span className="profile-edit-form__label">Custom Label</span>
                  <input
                    value={link.label}
                    onChange={(e) => handleProfileLinkChange(link.id, "label", e.target.value)}
                    className="profile-edit-form__input"
                    placeholder="Discord, Website, Email, Commission Form"
                  />
                </label>
              )}

              <button
                type="button"
                onClick={() => removeProfileLink(link.id)}
                className="profile-edit-form__link-remove"
              >
                Remove Link
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" onClick={addProfileLink} className="profile-edit-form__link-add">
        Add Link
      </button>

      <div className="profile-edit-form__section">
        <p className="profile-edit-form__section-title">Personal Details</p>
      </div>

      <div className="profile-edit-form__grid">
        <label className="profile-edit-form__field">
          <span className="profile-edit-form__label">Birth Date</span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="profile-edit-form__input"
          />
        </label>

        <label className="profile-edit-form__field">
          <span className="profile-edit-form__label">Gender</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="profile-edit-form__input profile-edit-form__select"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="profile-edit-form__field">
        <span className="profile-edit-form__label">Country</span>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="profile-edit-form__input"
          placeholder="Type to search your country"
          list="edit-country-options"
        />
        <datalist id="edit-country-options">
          {COUNTRIES.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </label>

      <div className="profile-edit-form__section">
        <p className="profile-edit-form__section-title">Privacy</p>
      </div>

      <div className="profile-edit-form__privacy-list">
        <label className="profile-edit-form__toggle">
          <input
            type="checkbox"
            checked={showBirthDate}
            onChange={(e) => setShowBirthDate(e.target.checked)}
          />
          <span>Show birth date to other users</span>
        </label>

        <label className="profile-edit-form__toggle">
          <input
            type="checkbox"
            checked={showGender}
            onChange={(e) => setShowGender(e.target.checked)}
          />
          <span>Show gender to other users</span>
        </label>

        <label className="profile-edit-form__toggle">
          <input
            type="checkbox"
            checked={showCountry}
            onChange={(e) => setShowCountry(e.target.checked)}
          />
          <span>Show country to other users</span>
        </label>
      </div>

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
