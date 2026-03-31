import Navbar from "@/components/Navbar";
import Link from "next/link";

const stats = [
  { label: "Providers", value: "0" },
  { label: "Endpoints", value: "0" },
  { label: "Tests Passed", value: "0" },
  { label: "Tests Failed", value: "0" },
];

const quickActions = [
  { href: "/providers/new", label: "Add Provider", primary: true },
  { href: "/tests", label: "Run Tests", primary: false },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col gap-16">

        {/* Hero */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              <span className="text-[var(--brand-accent)]">tapi</span>
              <span className="text-[var(--brand-primary)]">tapi</span>
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] max-w-xl">
              A unified workspace for testing, validating, and monitoring HTTP APIs across any provider.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {quickActions.map(({ href, label, primary }) => (
              <Link
                key={href}
                href={href}
                className={`px-5 py-2.5 rounded-md text-sm font-bold transition-colors ${
                  primary
                    ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-blue)]"
                    : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-5 flex flex-col gap-1"
            >
              <span className="text-3xl font-bold text-[var(--foreground)]">{value}</span>
              <span className="text-sm text-[var(--foreground-muted)]">{label}</span>
            </div>
          ))}
        </section>

        {/* Recent activity */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Runs</h2>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
            <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] opacity-20" />
              <p className="text-[var(--foreground-muted)] text-sm">
                No test runs yet.{" "}
                <Link href="/providers/new" className="text-[var(--brand-accent)] hover:underline">
                  Add a provider
                </Link>{" "}
                to get started.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
