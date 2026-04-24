import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { UploadApiResponse } from "cloudinary";

function parseTags(tagsValue: FormDataEntryValue | null) {
  if (typeof tagsValue !== "string" || !tagsValue.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(tagsValue);

    if (Array.isArray(parsed)) {
      return parsed
        .map((tag) => String(tag).trim().toLowerCase())
        .filter((tag) => tag.length > 0);
    }
  } catch {
    return tagsValue
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return Response.json({ error: "Please sign in before uploading." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const titleValue = formData.get("title") ?? formData.get("name");
    const title = typeof titleValue === "string" ? titleValue.trim() : "";
    const descriptionValue = formData.get("description");
    const description =
      typeof descriptionValue === "string" && descriptionValue.trim()
        ? descriptionValue.trim()
        : null;
    const tagList = parseTags(formData.get("tags"));

    if (!(file instanceof File)) {
      return Response.json({ error: "Please choose an image file." }, { status: 400 });
    }

    if (!title) {
      return Response.json({ error: "Please enter an image title." }, { status: 400 });
    }

    if (tagList.length === 0) {
      return Response.json({ error: "Please add at least 1 tag before uploading." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "my-gallery",
          },
          (err, result) => {
            if (err || !result) {
              reject(err ?? new Error("Cloudinary upload failed"));
              return;
            }

            resolve(result);
          }
        )
        .end(buffer);
    });

    const image = await prisma.image.create({
      data: {
        title,
        description,
        imageUrl: upload.secure_url,
        userId,
        tags: {
          connectOrCreate: tagList.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    return Response.json(image);
  } catch (error) {
    console.error("Upload API error:", error);

    const message =
      error instanceof Error ? error.message : "An error occurred while uploading.";

    return Response.json({ error: message }, { status: 500 });
  }
}
