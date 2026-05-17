import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/getCurrentUser"

function toNumber(value: bigint | number | null | undefined) {
  if (typeof value === "bigint") return Number(value)
  return Number(value ?? 0)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUserId = await getCurrentUserId()

    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!image) {
      return Response.json({ error: "Image not found" }, { status: 404 })
    }

    const [likeCountResult, likedResult] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
        `SELECT COUNT(*)::bigint AS count FROM "Like" WHERE "imageId" = $1`,
        image.id
      ),
      prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
        `SELECT COUNT(*)::bigint AS count
         FROM "Like"
         WHERE "imageId" = $1 AND "userId" = $2`,
        image.id,
        currentUserId ?? "__guest__"
      ),
    ])

    return Response.json({
      id: image.id,
      title: image.title,
      description: image.description,
      imageUrl: image.imageUrl,
      createdAt: image.createdAt.toISOString(),
      userId: image.userId,
      user: image.user,
      tags: image.tags,
      comments: image.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        userId: comment.userId,
        imageId: comment.imageId,
        user: comment.user,
      })),
      likeCount: toNumber(likeCountResult[0]?.count),
      isLiked: toNumber(likedResult[0]?.count) > 0,
    })
  } catch (error) {
    console.error("Image API error:", error)
    return Response.json({ error: "Unable to load image right now." }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const userId = await getCurrentUserId()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 🔍 หา image
  const image = await prisma.image.findUnique({
    where: { id }
  })

  if (!image) {
    return Response.json({ error: "Image not found" }, { status: 404 })
  }

  // 🔒 เช็คเจ้าของ
  if (image.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // 🗑️ ลบ
  await prisma.image.delete({
    where: { id }
  })

  return Response.json({ message: "Deleted successfully" })
}
