import RegisterForm from "@/components/ui/RegisterForm"

export default async function RegisterPage() {
  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6">
      <div
        className="absolute left-1/2 top-14 h-64 w-64 -translate-x-[135%] rounded-full blur-3xl"
        style={{ background: "rgba(14, 165, 233, 0.12)" }}
      />
      <div
        className="absolute right-1/2 top-32 h-72 w-72 translate-x-[145%] rounded-full blur-3xl"
        style={{ background: "rgba(99, 102, 241, 0.12)" }}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div
          className="order-2 mx-auto w-full max-w-md rounded-[32px] p-6 shadow-2xl sm:p-8 lg:order-1"
          style={{
            background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.16)",
            backdropFilter: "blur(18px)",
          }}
        >
          <RegisterForm />
        </div>

        <div className="order-1 lg:order-2">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.35em]"
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Creator Onboarding
          </span>
          <h2 className="mt-6 max-w-lg text-5xl font-semibold leading-tight tracking-tight">
            Start sharing your visual work in a space that feels curated.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7" style={{ color: "var(--color-text-muted)" }}>
            Register once and you can upload, organize, and present your images with a cleaner experience across every page.
          </p>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            {[
              "Profile-ready pages",
              "Quick image uploads",
              "Tag-based organization",
              "Consistent light and dark themes",
            ].map((item) => (
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
      </div>
    </section>
  )
}
