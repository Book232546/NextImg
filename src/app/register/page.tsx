import RegisterForm from "@/components/ui/RegisterForm"
import "@/styles/register.css"

const registerHighlights = [
  "Profile-ready pages",
  "Quick image uploads",
  "Tag-based organization",
  "Consistent light and dark themes",
]

export default async function RegisterPage() {
  return (
    <section className="register-shell">
      <div className="register-shell__glow register-shell__glow--left" />
      <div className="register-shell__glow register-shell__glow--right" />

      <div className="register-layout">
        <div className="register-panel">
          <RegisterForm />
        </div>

        <div className="register-hero">
          <span className="register-hero__eyebrow">Creator Onboarding</span>
          <h2 className="register-hero__title">Start sharing your visual work in a space that feels curated.</h2>
          <p className="register-hero__description">
            Register once and you can upload, organize, and present your images with a cleaner experience across every page.
          </p>

          <div className="register-hero__grid">
            {registerHighlights.map((item) => (
              <div key={item} className="register-hero__card">
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
