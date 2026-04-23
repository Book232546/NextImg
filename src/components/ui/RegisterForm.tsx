"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!PASSWORD_RULE.test(form.password)) {
      setError("Password must be at least 8 characters and include 1 uppercase letter and 1 number.")
      setLoading(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Confirm password must match the password field.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Register failed")
      }

      setSuccess("Account created successfully. Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 900)
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
          Join NextImg
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Save your favorite work, upload new shots, and build your profile.
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

      {success && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(16, 185, 129, 0.10)",
            border: "1px solid rgba(16, 185, 129, 0.24)",
            color: "#059669",
          }}
        >
          {success}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium" style={{ color: "var(--color-text-soft)" }}>
            Username
          </span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="yourname"
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
            Email
          </span>
          <input
            name="email"
            type="email"
            value={form.email}
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
            placeholder="At least 8 chars, 1 uppercase, 1 number"
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
            Confirm Password
          </span>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Retype your password"
            className="w-full rounded-2xl px-4 py-3 outline-none transition"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </label>
      </div>

      <p className="text-xs leading-6" style={{ color: "var(--color-text-muted)" }}>
        Password requirements: at least 8 characters, 1 uppercase letter, and 1 number.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.16)",
        }}
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium" style={{ color: "var(--color-text)" }}>
          Sign in here
        </Link>
      </p>
    </form>
  )
}
