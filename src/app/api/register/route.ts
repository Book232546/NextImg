import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const username = String(body.username ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")
    const confirmPassword = String(body.confirmPassword ?? "")

    if (!username || !email || !password || !confirmPassword) {
      return Response.json({ error: "Please fill in all required fields." }, { status: 400 })
    }

    if (!PASSWORD_RULE.test(password)) {
      return Response.json(
        { error: "Password must be at least 8 characters and include 1 uppercase letter and 1 number." },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return Response.json({ error: "Confirm password must match the password field." }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    })

    if (existingUser) {
      return Response.json({ error: "Username or email is already in use." }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    })

    return Response.json(user)
  } catch (error) {
    console.error("Register API error:", error)
    return Response.json({ error: "Unable to create account right now." }, { status: 500 })
  }
}
