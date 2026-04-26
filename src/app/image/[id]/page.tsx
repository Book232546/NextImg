import CommentSection from "@/components/ui/CommentSection"
import DeleteButton from "@/components/ui/DeleteButton"
import LikeButton from "@/components/ui/LikeButton"
import { getCurrentNavbarUser } from "@/lib/getCurrentUser"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import "@/styles/image.css"

function toNumber(value: bigint | number | null | undefined) {
  if (typeof value === "bigint") return Number(value)
  return Number(value ?? 0)
}

export default async function ImagePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [image, currentUser] = await Promise.all([
    prisma.image.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    }),
    getCurrentNavbarUser(),
  ])

  if (!image) {
    return <div className="profile-empty">Not found</div>
  }

  const [latestImages, likeCountResult, likedResult] = await Promise.all([
    prisma.image.findMany({
      where: {
        userId: image.userId,
        NOT: { id: image.id },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
      },
    }),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*)::bigint AS count FROM "Like" WHERE "imageId" = $1`,
      image.id
    ),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*)::bigint AS count
       FROM "Like"
       WHERE "imageId" = $1 AND "userId" = $2`,
      image.id,
      currentUser?.id ?? "__guest__"
    ),
  ])

  const isOwner = currentUser?.id === image.userId
  const likeCount = toNumber(likeCountResult[0]?.count)
  const isLiked = toNumber(likedResult[0]?.count) > 0
  const serializedComments = image.comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
  }))

  return (
    <section className="image-shell">
      <div className="image-shell__glow image-shell__glow--left" />
      <div className="image-shell__glow image-shell__glow--right" />

      <div className="image-layout">
        <article className="image-card">
          <div className="image-stage">
            <img src={image.imageUrl} alt={image.title} className="image-stage__photo" />
          </div>

          <div className="image-body">
            <div className="image-toolbar">
              <span className="image-badge">Featured Shot</span>

              <div className="image-actions">
                <LikeButton
                  imageId={image.id}
                  initialLiked={isLiked}
                  initialCount={likeCount}
                  disabled={!currentUser}
                />

                {isOwner && (
                  <DeleteButton imageId={image.id} className="image-delete-button" />
                )}
              </div>
            </div>

            <div className="image-content">
              <h1 className="image-title">{image.title}</h1>
              <p className="image-description">{image.description ?? "No description provided for this image yet."}</p>

              <div className="image-tags">
                {image.tags.length > 0 ? (
                  image.tags.map((tag) => (
                    <span key={tag.id} className="image-tag">
                      #{tag.name}
                    </span>
                  ))
                ) : (
                  <span className="image-tag">#untagged</span>
                )}
              </div>
            </div>

            <CommentSection
              imageId={image.id}
              currentUser={currentUser ? {
                id: currentUser.id,
                username: currentUser.username,
                image: currentUser.image ?? null,
              } : null}
              initialComments={serializedComments}
            />
          </div>
        </article>

        <aside className="image-sidebar">
          <div className="image-sidecard">
            <h2 className="image-sidecard__title">Posted by</h2>
            <p className="image-sidecard__subtitle">Discover more from the creator behind this image.</p>

            <Link href={`/profile/${image.user.id}`} className="image-author">
              <img
                src={image.user.image ?? "/default-avatar.svg"}
                alt={image.user.username}
                className="image-author__avatar"
              />
              <div>
                <p className="image-author__name">{image.user.username}</p>
                <p className="image-author__meta">{image.user.bio ?? "Photographer on NextImg"}</p>
              </div>
            </Link>
          </div>

          <div className="image-sidecard">
            <h2 className="image-sidecard__title">Latest uploads</h2>
            <p className="image-sidecard__subtitle">Three recent images from {image.user.username}.</p>

            <div className="image-latest">
              {latestImages.length > 0 ? (
                latestImages.map((item) => (
                  <Link key={item.id} href={`/image/${item.id}`} className="image-latest__item">
                    <img src={item.imageUrl} alt={item.title} className="image-latest__thumb" />
                    <div>
                      <p className="image-latest__name">{item.title}</p>
                      <p className="image-latest__meta">
                        {item.description?.trim() ? item.description : "Open image"}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="profile-empty">
                  <p>No more uploads yet.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
