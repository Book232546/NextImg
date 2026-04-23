import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const userId = (await cookies()).get("userId")?.value

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