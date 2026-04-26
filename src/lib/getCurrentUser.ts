import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { getUserProfileById } from "./userProfile"

export async function getCurrentUserId() {
  const cookieStore = await cookies()
  return cookieStore.get("userId")?.value ?? null
}

export async function getCurrentNavbarUser() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      image: true,
    },
  })
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId()

  if (!userId) return null

  return getUserProfileById(userId)
}
