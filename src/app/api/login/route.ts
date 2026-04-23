import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const body = await req.json()
  const cookieStore = await cookies() // ✅ เรียกใช้แบบ await

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: body.identifier },
        { username: body.identifier }
      ]
    }
  })

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  const isValid = await bcrypt.compare(body.password, user.password)

  if (!isValid) {
    return Response.json({ error: "Invalid password" }, { status: 401 })
  }

  // ✅ ใส่ await หน้าการ set cookie
  await cookieStore.set("userId", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 // 1 วัน
  })

  return Response.json({
    message: "Login success",
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  })
}