"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import "@/styles/navbar.css"

type User = {
  id: string
  username: string
  image?: string | null
}

type Theme = "dark" | "light"

const THEME_STORAGE_KEY = "nextimg-theme"

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark", "light")
  document.documentElement.classList.add(theme)
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

export default function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark"
    }

    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark"
  })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleThemeToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const themeLabel = theme === "dark" ? "Light Mode" : "Dark Mode"
  const themeDescription = theme === "dark" ? "Current: Dark" : "Current: Light"

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <Link href="/" className="navbar__logo">
        NextImg
      </Link>

      <div className="navbar__search-wrap">
        <svg className="navbar__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input className="navbar__search" placeholder="Search photos..." />
      </div>

      <div className="navbar__right" ref={dropdownRef}>
        {user && (
          <Link href="/upload" className="navbar__upload">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </Link>
        )}

        {user ? (
          <>
            <button className="navbar__user-btn" onClick={() => setOpen((prev) => !prev)}>
              <div className="navbar__avatar-wrap">
                <img
                  src={user.image ?? "/default-avatar.svg"}
                  alt={user.username}
                  className="navbar__avatar"
                />
                <span className="navbar__online-dot" />
              </div>
              <span className="navbar__username">{user.username}</span>
              <svg
                className={`navbar__chevron ${open ? "navbar__chevron--open" : ""}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {open && (
              <div className="navbar__dropdown">
                <div className="navbar__dropdown-header">
                  <p className="navbar__dropdown-username">{user.username}</p>
                </div>

                <div className="navbar__dropdown-section">
                  <Link
                    href={`/profile/${user.id}`}
                    className="navbar__dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="navbar__dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                    </svg>
                    Settings
                  </Link>

                  <button className="navbar__dropdown-item" onClick={handleThemeToggle}>
                    <ThemeIcon theme={theme} />
                    <span className="navbar__theme-copy">
                      <span>{themeLabel}</span>
                      <span className="navbar__theme-status">{themeDescription}</span>
                    </span>
                  </button>
                </div>

                <div className="navbar__dropdown-section--danger">
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link href="/login" className="navbar__signin">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
