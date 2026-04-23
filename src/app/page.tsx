import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import "@/styles/home.css"

export default async function Home() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  let user = null
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } })
  }

  const images = await prisma.image.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="gallery-root">

      {/* Hero */}
      <header className={`page-hero ${!user ? "page-hero--guest" : ""}`}>
        <div className="page-hero__blob" aria-hidden="true" />
        <div className="page-hero__inner">
          {user ? (
            <>
              <span className="page-hero__label">Welcome back</span>
              <h1 className="page-hero__title">{user.username}</h1>
            </>
          ) : (
            <>
              <span className="page-hero__label">Gallery</span>
              <h1 className="page-hero__title">NextImg</h1>
              <p className="page-hero__subtitle">A space for drawing</p>
            </>
          )}
        </div>
      </header>

      <hr className="page-divider" />

      {/* Gallery */}
      <main className="gallery-main">
        {images.length === 0 ? (
          <div className="gallery-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="gallery-empty__text">No photos yet</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((img) => (
              <Link key={img.id} href={`/image/${img.id}`} className="gallery-card">
                <div className="gallery-card__inner">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="gallery-card__img"
                  />
                  <div className="gallery-card__overlay">
                    <p className="gallery-card__title">{img.title}</p>
                    <div className="gallery-card__meta">
                      <span className="gallery-card__dot" />
                      <span className="gallery-card__author">{img.user.username}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="gallery-footer">
        <div className="gallery-footer__inner">
          <span className="gallery-footer__brand">Lumière</span>
          <span className="gallery-footer__copy">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
