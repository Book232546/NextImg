import { cookies } from "next/headers"
import { getUserProfileById } from "./userProfile"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) return null

  return getUserProfileById(userId)
}
