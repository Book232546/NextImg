import { getCurrentUser } from "@/lib/getCurrentUser"
import { GENDER_OPTIONS } from "@/lib/countries"
import { getUserProfileById } from "@/lib/userProfile"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import "@/styles/profile.css"

const PROFILE_LINK_LABELS = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  X: "X",
  PATREON: "Patreon",
  KOFI: "Ko-fi",
  OTHER: "Link",
} as const

async function getFollowCount(column: "followingId" | "followerId", userId: string) {
  const safeColumn = column === "followingId" ? '"followingId"' : '"followerId"'
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM "Follow" WHERE ${safeColumn} = $1`,
    userId
  )

  const count = result[0]?.count ?? 0
  return typeof count === "bigint" ? Number(count) : count
}

export default async function ProfilePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [currentUser, user, images, followersCount, followingCount] = await Promise.all([
    getCurrentUser(),
    getUserProfileById(id),
    prisma.image.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    }),
    getFollowCount("followingId", id),
    getFollowCount("followerId", id),
  ])

  if (!user) {
    return <div className="profile-empty">User not found</div>
  }

  const isOwner = currentUser?.id === user.id
  const genderLabel =
    GENDER_OPTIONS.find((item) => item.value === user.gender)?.label ?? user.gender
  const personalItems = [
    {
      label: "Birth Date",
      value: user.birthDate
        ? new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(user.birthDate))
        : null,
      visible: isOwner || user.showBirthDate,
    },
    {
      label: "Gender",
      value: genderLabel,
      visible: isOwner || user.showGender,
    },
    {
      label: "Country",
      value: user.country,
      visible: isOwner || user.showCountry,
    },
  ].filter((item) => item.visible && item.value)
  const visibleProfileLinks = user.profileLinks.filter((link) => Boolean(link.url))

  return (
    <section className="profile-shell">
      <div className="profile-shell__glow profile-shell__glow--left" />
      <div className="profile-shell__glow profile-shell__glow--right" />

      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-hero">
            <div className="profile-hero__main">
              <img
                src={user.image ?? "/default-avatar.svg"}
                alt={user.username}
                className="profile-avatar"
              />

              <div className="profile-meta">
                <span className="profile-meta__eyebrow">Creator Profile</span>
                <h1 className="profile-meta__title">{user.username}</h1>
                <p className="profile-meta__bio">{user.bio ?? "No bio yet. This profile is still getting its story together."}</p>

                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="profile-stat__value">{images.length}</span>
                    <span className="profile-stat__label">Posts</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat__value">{followersCount}</span>
                    <span className="profile-stat__label">Followers</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat__value">{followingCount}</span>
                    <span className="profile-stat__label">Following</span>
                  </div>
                </div>

                {personalItems.length > 0 && (
                  <div className="profile-details">
                    {personalItems.map((item) => (
                      <div key={item.label} className="profile-detail">
                        <span className="profile-detail__label">{item.label}</span>
                        <span className="profile-detail__value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {visibleProfileLinks.length > 0 && (
                  <div className="profile-links">
                    {visibleProfileLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link-chip"
                      >
                        <span className="profile-link-chip__label">
                          {link.platform === "OTHER"
                            ? link.label || PROFILE_LINK_LABELS[link.platform]
                            : PROFILE_LINK_LABELS[link.platform]}
                        </span>
                        <span className="profile-link-chip__url">{new URL(link.url).hostname}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="profile-actions">
                <Link href="/profile/edit" className="profile-edit-btn">
                  Edit Profile
                </Link>
              </div>
            )}
          </div>

          <div className="profile-gallery">
            <div className="profile-gallery__header">
              <div>
                <h2 className="profile-gallery__title">Gallery</h2>
                <p className="profile-gallery__subtitle">
                  {isOwner ? "Your latest uploads in one place." : `Recent uploads from ${user.username}.`}
                </p>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="profile-empty">
                <p>No images uploaded yet.</p>
              </div>
            ) : (
              <div className="profile-gallery__grid">
                {images.map((img) => (
                  <Link key={img.id} href={`/image/${img.id}`} className="profile-gallery__link">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="profile-gallery__image"
                    />
                    <div className="profile-gallery__caption">
                      <p className="profile-gallery__name">{img.title}</p>
                      <p className="profile-gallery__meta">
                        {img.description?.trim() ? img.description : "No description"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
