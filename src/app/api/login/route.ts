import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const body = await req.json()
  const cookieStore = await cookies()
  const identifier = String(body.identifier ?? "").trim()
  const password = String(body.password ?? "")

  if (!identifier || !password) {
    return Response.json({ error: "Username/email and password are required." }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  })

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return Response.json({ error: "Invalid password" }, { status: 401 })
  }

  await cookieStore.set("userId", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return Response.json({
    message: "Login success",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  })
}
