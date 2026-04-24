import { getCurrentUser } from "@/lib/getCurrentUser"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return Response.json({ error: "Please sign in first." }, { status: 401 })
    }

    const { id: imageId } = await params
    const body = await req.json()
    const content = String(body?.content ?? "").trim()

    if (!content) {
      return Response.json({ error: "Comment cannot be empty." }, { status: 400 })
    }

    if (content.length > 500) {
      return Response.json({ error: "Comment must be 500 characters or fewer." }, { status: 400 })
    }

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true },
    })

    if (!image) {
      return Response.json({ error: "Image not found." }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        imageId,
        userId: currentUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    })

    return Response.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user,
      },
    })
  } catch (error) {
    console.error("Comment API error:", error)
    return Response.json({ error: "Unable to post comment right now." }, { status: 500 })
  }
}
