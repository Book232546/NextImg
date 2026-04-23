import LoginForm from "@/components/ui/LoginForm"

export default async function LoginPage() {

  return (
    <div>
      {/* ✅ Server ดึง user */}

      {/* ✅ ส่งให้ client */}
      <LoginForm />
    </div>
  )
}