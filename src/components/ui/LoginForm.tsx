"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    router.prefetch("/")
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    let shouldKeepLoading = false

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

      shouldKeepLoading = true
      router.replace("/")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      if (!shouldKeepLoading) {
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-form__header">
        <span className="login-form__badge">Welcome Back</span>
        <div>
          <h1 className="login-form__title">Sign in</h1>
          <p className="login-form__subtitle">
            Continue building your image collection with NextImg.
          </p>
        </div>
      </div>

      {error && <div className="login-form__message login-form__message--error">{error}</div>}

      <div className="login-form__fields">
        <label className="login-form__field">
          <span className="login-form__label">Username or Email</span>
          <input
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder="yourname@example.com"
            className="login-form__input"
          />
        </label>

        <label className="login-form__field">
          <span className="login-form__label">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="login-form__input"
          />
        </label>
      </div>

      <button type="submit" disabled={loading} className="login-form__submit">
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="login-form__footer">
        New to NextImg?{" "}
        <Link href="/register" className="login-form__link">
          Create an account
        </Link>
      </p>
    </form>
  )
}
