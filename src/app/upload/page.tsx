import UploadForm from "@/components/ui/UploadForm"
import { getCurrentUser } from "@/lib/getCurrentUser"
import { redirect } from "next/navigation"
import "@/styles/upload.css"

const uploadHighlights = [
  "Add a clear title",
  "Use at least one tag",
  "Write context for your audience",
  "Keep your gallery organized",
]

export default async function UploadPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <section className="upload-shell">
      <div className="upload-shell__glow upload-shell__glow--left" />
      <div className="upload-shell__glow upload-shell__glow--right" />

      <div className="upload-layout">
        <div className="upload-hero">
          <span className="upload-hero__eyebrow">Upload Studio</span>
          <h1 className="upload-hero__title">Share a new image with a cleaner publishing flow.</h1>
          <p className="upload-hero__description">
            Add a strong title, describe the image, and attach meaningful tags so people can discover your work faster.
          </p>

          <div className="upload-hero__grid">
            {uploadHighlights.map((item) => (
              <div key={item} className="upload-hero__card">
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="upload-panel">
          <UploadForm />
        </div>
      </div>
    </section>
  )
}
