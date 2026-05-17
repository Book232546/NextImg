"use client"

import { AUTH_STORAGE_KEY } from "@/lib/authShared"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const token = window.localStorage.getItem(AUTH_STORAGE_KEY)
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    if (res.ok) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Log out
    </button>
  )
}
