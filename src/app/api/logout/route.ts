import { clearAuthCookie, deleteSessionByToken, extractBearerToken } from "@/lib/authSession"

export async function POST(req: Request) {
  const bearerToken = extractBearerToken(req.headers.get("authorization"))
  let bodyToken: string | null = null

  if (!bearerToken) {
    try {
      const body = await req.json()
      bodyToken = typeof body?.token === "string" ? body.token.trim() : null
    } catch {
      bodyToken = null
    }
  }

  const token = bearerToken ?? bodyToken

  if (!token) {
    return Response.json({ error: "Authorization token is required." }, { status: 401 })
  }

  const session = await deleteSessionByToken(token)

  if (!session) {
    return Response.json({ error: "Invalid or expired token." }, { status: 401 })
  }

  await clearAuthCookie()

  return Response.json({ message: "Logged out" })
}
