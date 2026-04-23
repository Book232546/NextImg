"use client"

import { useState } from "react"

export default function RegisterForm() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    })

    // ฟังก์ชันกลางสำหรับอัปเดต State ตามชื่อ name ของ input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })

            const data = await res.json()
            console.log("Response:", data)

            if (res.ok) {
                alert("ลงทะเบียนสำเร็จ!")
            }
        } catch (error) {
            console.error("Error:", error)
        }
    }

    

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="username"
                className="border p-2"
            />
            <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email"
                className="border p-2"
            />
            <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="password"
                className="border p-2"
            />
            <button type="submit" className="bg-blue-500 text-white p-2">
                Register
            </button>
            <a href="/login" className="text-blue-500 underline">ไปหน้า Login</a>
        </form>
    )
}