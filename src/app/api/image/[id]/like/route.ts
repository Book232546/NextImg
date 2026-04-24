import { getCurrentUser } from "@/lib/getCurrentUser"
import { prisma } from "@/lib/prisma"

function toNumber(value: bigint | number | null | undefined) {
  if (typeof value === "bigint") return Number(value)
  return Number(value ?? 0)
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: imageId } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return Response.json({ error: "Please sign in first." }, { status: 401 })
    }

    const existingLike = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM "Like" WHERE "userId" = $1 AND "imageId" = $2 LIMIT 1`,
      currentUser.id,
      imageId
    )

    let liked = false

    if (existingLike.length > 0) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "Like" WHERE "userId" = $1 AND "imageId" = $2`,
        currentUser.id,
        imageId
      )
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Like" ("id", "createdAt", "userId", "imageId")
         VALUES ($1, NOW(), $2, $3)`,
        crypto.randomUUID(),
        currentUser.id,
        imageId
      )
      liked = true
    }

    const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*)::bigint AS count FROM "Like" WHERE "imageId" = $1`,
      imageId
    )

    return Response.json({
      liked,
      count: toNumber(countResult[0]?.count),
    })
  } catch (error) {
    console.error("Like API error:", error)
    return Response.json({ error: "Unable to update like right now." }, { status: 500 })
  }
}
