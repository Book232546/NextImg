import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ProfilePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!user) return <div>User not found</div>

  return (
    <div>
      <div className="max-w-5xl mx-auto p-6">

        <div className="flex items-center gap-6 mb-8">
          <img
            src={user.image ?? "/default-avatar.svg"}
            alt={user.username}
            className="w-24 h-24 rounded-full"
          />

          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p style={{ color: "var(--color-text-muted)" }}>
              {user.bio ?? "No bio yet"}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Images</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {user.images.map((img) => (
            <Link key={img.id} href={`/image/${img.id}`}>
              <img
                src={img.imageUrl}
                alt={img.title}
                className="w-full rounded cursor-pointer"
              />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
