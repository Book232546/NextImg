"use client"

import { useRouter } from "next/navigation"

export default function DeleteButton({ imageId }: { imageId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    const confirmDelete = confirm("Delete this image?")
    if (!confirmDelete) return

    await fetch(`/api/image/${imageId}`, {
      method: "DELETE"
    })

    router.push("/") // กลับหน้า home
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-2 rounded mt-4"
    >
      Delete
    </button>
  )
}