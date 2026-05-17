import { cookies } from "next/headers"
import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { AUTH_COOKIE_NAME } from "@/lib/authShared"

const SESSION_TTL_MS = 1000 * 60 * 60 * 24

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export async function setAuthCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies()

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
  cookieStore.delete("userId")
}

export async function getSessionByToken(token: string) {
  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  return session
}

export async function getCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return getSessionByToken(token)
}

export async function deleteSessionByToken(token: string) {
  const session = await getSessionByToken(token)

  if (!session) {
    return null
  }

  await prisma.session.delete({
    where: {
      id: session.id,
    },
  })

  return session
}

export function extractBearerToken(headerValue: string | null) {
  if (!headerValue) {
    return null
  }

  const [scheme, token] = headerValue.split(" ")

  if (scheme !== "Bearer" || !token) {
    return null
  }

  return token.trim()
}
