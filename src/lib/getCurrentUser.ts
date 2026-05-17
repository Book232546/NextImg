import { prisma } from "./prisma"
import { getCurrentSession } from "./authSession"
import { getUserProfileById } from "./userProfile"

export async function getCurrentUserId() {
  const session = await getCurrentSession()
  return session?.userId ?? null
}

export async function getCurrentNavbarUser() {
  const session = await getCurrentSession()

  if (!session) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
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
