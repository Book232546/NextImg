"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type LikeButtonProps = {
  imageId: string
  initialLiked: boolean
  initialCount: number
  disabled?: boolean
}

export default function LikeButton({
  imageId,
  initialLiked,
  initialCount,
  disabled = false,
}: LikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (disabled || loading) {
      if (disabled) router.push("/login")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/image/${imageId}/like`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to update like")
      }

      setLiked(Boolean(data.liked))
      setCount(Number(data.count ?? 0))
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`image-like-button ${liked ? "image-like-button--active" : ""}`}
      aria-pressed={liked}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="m12 21-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18z" />
      </svg>
      <span>{liked ? "Liked" : "Like"}</span>
      <span>({count})</span>
    </button>
  )
}
