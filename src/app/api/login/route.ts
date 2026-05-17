import { createSession, setAuthCookie } from "@/lib/authSession"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const body = await req.json()
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
    return Response.json({ error: "Invalid username/email or password" }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return Response.json({ error: "Invalid username/email or password" }, { status: 401 })
  }

  const { token, expiresAt } = await createSession(user.id)
  await setAuthCookie(token, expiresAt)

  return Response.json({
    message: "Login success",
    token,
    expiresAt: expiresAt.toISOString(),
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  })
}
