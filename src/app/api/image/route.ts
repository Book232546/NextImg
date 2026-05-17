import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json(
      images.map((image) => ({
        id: image.id,
        title: image.title,
        description: image.description,
        imageUrl: image.imageUrl,
        createdAt: image.createdAt.toISOString(),
        userId: image.userId,
        user: image.user,
        tags: image.tags,
      }))
    )
  } catch (error) {
    console.error("Image API error:", error)
    return Response.json({ error: "Unable to load images right now." }, { status: 500 })
  }
}
