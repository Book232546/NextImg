import cloudinary from "@/lib/cloudinary"
import { COUNTRIES } from "@/lib/countries"
import { getCurrentUser } from "@/lib/getCurrentUser"
import {
  findUserIdByUsername,
  type ProfileLinkPlatform,
  updateUserProfile,
} from "@/lib/userProfile"
import type { UploadApiResponse } from "cloudinary"

const GENDERS = new Set(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
const PROFILE_LINK_PLATFORMS = new Set(["FACEBOOK", "INSTAGRAM", "X", "PATREON", "KOFI", "OTHER"])
const COUNTRY_LOOKUP = new Map(COUNTRIES.map((country) => [country.toLowerCase(), country]))

type ProfileLinkInput = {
  platform: ProfileLinkPlatform
  label: string | null
  url: string
}

function normalizeProfileLinks(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const normalized: ProfileLinkInput[] = []

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue
    }

    const platform = String((item as { platform?: unknown }).platform ?? "")
      .trim()
      .toUpperCase()
    const label = String((item as { label?: unknown }).label ?? "").trim()
    const rawUrl = String((item as { url?: unknown }).url ?? "").trim()

    if (!platform && !label && !rawUrl) {
      continue
    }

    if (!PROFILE_LINK_PLATFORMS.has(platform)) {
      throw new Error("One of the selected link platforms is invalid.")
    }

    if (!rawUrl) {
      throw new Error("Each profile link must include a URL.")
    }

    const candidateUrl = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawUrl) ? rawUrl : `https://${rawUrl}`

    let parsed: URL
    try {
      parsed = new URL(candidateUrl)
    } catch {
      throw new Error("One of the profile links has an invalid URL.")
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Profile links must use http or https.")
    }

    if (platform === "OTHER" && !label) {
      throw new Error("Custom links need a label so people know where they go.")
    }

    normalized.push({
      platform: platform as ProfileLinkPlatform,
      label: label || null,
      url: parsed.toString(),
    })
  }

  return normalized
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return Response.json({ error: "Please sign in first." }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") ?? ""
    let username = ""
    let bio = ""
    let image = ""
    let birthDateValue = ""
    let gender = "PREFER_NOT_TO_SAY"
    let country = ""
    let showBirthDate = true
    let showGender = true
    let showCountry = true
    let profileLinks: ProfileLinkInput[] = []

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      username = String(formData.get("username") ?? "").trim()
      bio = String(formData.get("bio") ?? "").trim()
      image = String(formData.get("image") ?? "").trim()
      birthDateValue = String(formData.get("birthDate") ?? "").trim()
      gender = String(formData.get("gender") ?? "PREFER_NOT_TO_SAY").trim()
      country = String(formData.get("country") ?? "").trim()
      showBirthDate = String(formData.get("showBirthDate") ?? "false") === "true"
      showGender = String(formData.get("showGender") ?? "false") === "true"
      showCountry = String(formData.get("showCountry") ?? "false") === "true"
      profileLinks = normalizeProfileLinks(JSON.parse(String(formData.get("profileLinks") ?? "[]")))

      const file = formData.get("avatar")

      if (file instanceof File && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "my-gallery/avatars",
              },
              (err, result) => {
                if (err || !result) {
                  reject(err ?? new Error("Avatar upload failed"))
                  return
                }

                resolve(result)
              }
            )
            .end(buffer)
        })

        image = upload.secure_url
      }
    } else {
      const body = await req.json()
      username = String(body.username ?? "").trim()
      bio = String(body.bio ?? "").trim()
      image = String(body.image ?? "").trim()
      birthDateValue = String(body.birthDate ?? "").trim()
      gender = String(body.gender ?? "PREFER_NOT_TO_SAY").trim()
      country = String(body.country ?? "").trim()
      showBirthDate = Boolean(body.showBirthDate)
      showGender = Boolean(body.showGender)
      showCountry = Boolean(body.showCountry)
      profileLinks = normalizeProfileLinks(body.profileLinks)
    }

    if (!username) {
      return Response.json({ error: "Username is required." }, { status: 400 })
    }

    if (!gender || !GENDERS.has(gender)) {
      return Response.json({ error: "Selected gender is invalid." }, { status: 400 })
    }

    const normalizedCountry = country ? COUNTRY_LOOKUP.get(country.toLowerCase()) ?? null : null

    if (country && !normalizedCountry) {
      return Response.json({ error: "Selected country is invalid." }, { status: 400 })
    }

    let birthDate: Date | null = null
    if (birthDateValue) {
      birthDate = new Date(birthDateValue)
      if (Number.isNaN(birthDate.getTime())) {
        return Response.json({ error: "Birth date is invalid." }, { status: 400 })
      }
    }

    const existingUserId = await findUserIdByUsername(username, currentUser.id)

    if (existingUserId) {
      return Response.json({ error: "This username is already taken." }, { status: 409 })
    }

    const updatedUser = await updateUserProfile({
      userId: currentUser.id,
      username,
      bio: bio || null,
      image: image || null,
      birthDate,
      gender: gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
      country: normalizedCountry,
      showBirthDate,
      showGender,
      showCountry,
      profileLinks,
    })

    if (!updatedUser) {
      return Response.json({ error: "User not found." }, { status: 404 })
    }

    return Response.json(updatedUser)
  } catch (error) {
    console.error("Profile API error:", error)
    const message =
      error instanceof Error ? error.message : "Unable to update profile right now."
    return Response.json({ error: message }, { status: 500 })
  }
}
