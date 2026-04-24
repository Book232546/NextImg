import LoginForm from "@/components/ui/LoginForm"
import "@/styles/login.css"

const loginHighlights = [
  "Upload faster",
  "Keep profiles polished",
  "Browse in dark or light",
  "Built for creators",
]

export default async function LoginPage() {
  return (
    <section className="login-shell">
      <div className="login-shell__glow login-shell__glow--left" />
      <div className="login-shell__glow login-shell__glow--right" />

      <div className="login-layout">
        <div className="login-hero">
          <span className="login-hero__eyebrow">NextImg Access</span>
          <h2 className="login-hero__title">A cleaner way to manage your image gallery.</h2>
          <p className="login-hero__description">
            Jump back into your workspace, review your uploads, and keep your portfolio moving without losing the visual style of the rest of the app.
          </p>

          <div className="login-hero__grid">
            {loginHighlights.map((item) => (
              <div key={item} className="login-hero__card">
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="login-panel">
          <LoginForm />
        </div>
      </div>
    </section>
  )
}
