"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <span
          className="inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.3em]"
          style={{
            background: "var(--surface-muted)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          Welcome Back
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Continue building your image collection with NextImg.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.10)",
            border: "1px solid rgba(239, 68, 68, 0.24)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium" style={{ color: "var(--color-text-soft)" }}>
            Username or Email
          </span>
          <input
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder="yourname@example.com"
            className="w-full rounded-2xl px-4 py-3 outline-none transition"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium" style={{ color: "var(--color-text-soft)" }}>
            Password
          </span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-2xl px-4 py-3 outline-none transition"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          boxShadow: "0 20px 40px rgba(16, 185, 129, 0.22)",
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
        New to NextImg?{" "}
        <Link href="/register" className="font-medium" style={{ color: "var(--color-text)" }}>
          Create an account
        </Link>
      </p>
    </form>
  )
}
