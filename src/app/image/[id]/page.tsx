import { prisma } from "@/lib/prisma"
import DeleteButton from "@/components/ui/DeleteButton"
import { getCurrentUser } from "@/lib/getCurrentUser"

export default async function ImagePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      user: true,
      tags: true // ✅ ต้องมีอันนี้
    }
  })

  if (!image) return <div>Not found</div>

  const currentUser = await getCurrentUser()

  return (
    <div>

      <div className="p-10 max-w-4xl mx-auto">

        {/* ลบได้เฉพาะเจ้าของ */}
        {currentUser?.id === image.userId && (
          <DeleteButton imageId={image.id} />
        )}

        <img src={image.imageUrl} alt={image.title} className="w-full rounded" />

        <h1 className="text-2xl font-bold mt-4">
          {image.title}
        </h1>

        <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
          {image.description ?? "No description"}
        </p>

        <div className="mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
          By {image.user.username}
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {image.tags?.map(tag => (
            <span
              key={tag.id}
              className="px-2 py-1 rounded text-sm"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
