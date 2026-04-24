import cloudinary from "@/lib/cloudinary"
import { getCurrentUser } from "@/lib/getCurrentUser"
import { prisma } from "@/lib/prisma"
import type { UploadApiResponse } from "cloudinary"

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

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      username = String(formData.get("username") ?? "").trim()
      bio = String(formData.get("bio") ?? "").trim()
      image = String(formData.get("image") ?? "").trim()

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
    }

    if (!username) {
      return Response.json({ error: "Username is required." }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: currentUser.id },
      },
    })

    if (existingUser) {
      return Response.json({ error: "This username is already taken." }, { status: 409 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        username,
        bio: bio || null,
        image: image || null,
      },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      },
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error("Profile API error:", error)
    return Response.json({ error: "Unable to update profile right now." }, { status: 500 })
  }
}
