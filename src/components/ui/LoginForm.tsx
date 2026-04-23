"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    identifier: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      router.push("/")
      router.refresh()

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-4">
      <h1 className="text-xl font-bold">Login</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        name="identifier"
        value={form.identifier}
        onChange={handleChange}
        placeholder="Username or Email"
        className="border p-2 rounded"
      />

      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white p-2 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <a href="/register" className="text-blue-500 underline">
        สมัครสมาชิก
      </a>
    </form>
  )
}