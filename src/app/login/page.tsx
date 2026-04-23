import LoginForm from "@/components/ui/LoginForm"

export default async function LoginPage() {
  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6">
      <div
        className="absolute left-1/2 top-16 h-64 w-64 -translate-x-[130%] rounded-full blur-3xl"
        style={{ background: "rgba(16, 185, 129, 0.14)" }}
      />
      <div
        className="absolute right-1/2 top-28 h-72 w-72 translate-x-[145%] rounded-full blur-3xl"
        style={{ background: "rgba(59, 130, 246, 0.10)" }}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.35em]"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            NextImg Access
          </span>
          <h2 className="mt-6 max-w-lg text-5xl font-semibold leading-tight tracking-tight">
            A cleaner way to manage your image gallery.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7" style={{ color: "var(--color-text-muted)" }}>
            Jump back into your workspace, review your uploads, and keep your portfolio moving without losing the visual style of the rest of the app.
          </p>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            {["Upload faster", "Keep profiles polished", "Browse in dark or light", "Built for creators"].map((item) => (
              <div
                key={item}
                className="rounded-3xl px-5 py-4"
                style={{
                  background: "var(--surface-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mx-auto w-full max-w-md rounded-[32px] p-6 shadow-2xl sm:p-8"
          style={{
            background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.16)",
            backdropFilter: "blur(18px)",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </section>
  )
}
