import UploadForm from "@/components/ui/UploadForm"
import { getCurrentUser } from "@/lib/getCurrentUser"
import { redirect } from "next/navigation"

export default async function UploadPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="p-10">
      <UploadForm />
    </div>
  )
}