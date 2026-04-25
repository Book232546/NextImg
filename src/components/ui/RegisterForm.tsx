"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { COUNTRIES, GENDER_OPTIONS } from "@/lib/countries"

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "PREFER_NOT_TO_SAY",
    country: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    if (!form.birthDate || !form.country.trim()) {
      setError("Birth date and country are required.")
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
    <form onSubmit={handleSubmit} className="register-form">
      <div className="register-form__header">
        <span className="register-form__badge">Join NextImg</span>
        <div>
          <h1 className="register-form__title">Create account</h1>
          <p className="register-form__subtitle">
            Save your favorite work, upload new shots, and build your profile.
          </p>
        </div>
      </div>

      {error && <div className="register-form__message register-form__message--error">{error}</div>}
      {success && <div className="register-form__message register-form__message--success">{success}</div>}

      <div className="register-form__fields">
        <label className="register-form__field">
          <span className="register-form__label">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="yourname"
            className="register-form__input"
          />
        </label>

        <label className="register-form__field">
          <span className="register-form__label">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="yourname@example.com"
            className="register-form__input"
          />
        </label>

        <div className="register-form__section">
          <p className="register-form__section-title">Personal Details</p>
        </div>

        <div className="register-form__grid">
          <label className="register-form__field">
            <span className="register-form__label">Birth Date</span>
            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
              className="register-form__input"
            />
          </label>

          <label className="register-form__field">
            <span className="register-form__label">Gender</span>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="register-form__input register-form__select"
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="register-form__field">
          <span className="register-form__label">Country</span>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Type to search your country"
            className="register-form__input"
            list="country-options"
          />
          <datalist id="country-options">
            {COUNTRIES.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
        </label>

        <label className="register-form__field">
          <span className="register-form__label">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 chars, 1 uppercase, 1 number"
            className="register-form__input"
          />
        </label>

        <label className="register-form__field">
          <span className="register-form__label">Confirm Password</span>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Retype your password"
            className="register-form__input"
          />
        </label>
      </div>

      <p className="register-form__hint">
        Password requirements: at least 8 characters, 1 uppercase letter, and 1 number.
      </p>

      <button type="submit" disabled={loading} className="register-form__submit">
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <p className="register-form__footer">
        Already have an account?{" "}
        <Link href="/login" className="register-form__link">
          Sign in here
        </Link>
      </p>
    </form>
  )
}
