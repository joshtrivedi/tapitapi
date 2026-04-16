import Navbar from "@/components/Navbar";
import Link from "next/link";
import db from "@/lib/db";
import RunRow from "@/components/RunRow";
import type { TestRun } from "@/app/results/page";

function getStats() {
  const providers = (db.prepare(`SELECT COUNT(*) as n FROM providers`).get() as { n: number }).n;
  const endpoints = (db.prepare(`SELECT COUNT(*) as n FROM endpoints`).get() as { n: number }).n;
  const passed = (db.prepare(`SELECT COUNT(*) as n FROM test_runs WHERE status = 'passed'`).get() as { n: number }).n;
  const failed = (db.prepare(`SELECT COUNT(*) as n FROM test_runs WHERE status IN ('failed', 'error')`).get() as { n: number }).n;
  return { providers, endpoints, passed, failed };
}

function getRecentRuns(): TestRun[] {
  return db
    .prepare(
      `SELECT
         r.id, r.status, r.status_code, r.latency_ms, r.response_body, r.error, r.ran_at,
         p.name as provider_name,
         e.method, e.path
       FROM test_runs r
       JOIN providers p ON p.id = r.provider_id
       LEFT JOIN endpoints e ON e.id = r.endpoint_id
       ORDER BY r.ran_at DESC
       LIMIT 5`
    )
    .all() as TestRun[];
}

const quickActions = [
  { href: "/providers/new", label: "Add Provider", primary: true },
  { href: "/tests", label: "Run Tests", primary: false },
];

export default function Home() {
  const { providers, endpoints, passed, failed } = getStats();
  const recentRuns = getRecentRuns();

  const stats = [
    { label: "Providers", value: providers },
    { label: "Endpoints", value: endpoints },
    { label: "Tests Passed", value: passed },
    { label: "Tests Failed", value: failed },
  ];

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

        {/* Recent runs */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Runs</h2>
            {recentRuns.length > 0 && (
              <Link href="/results" className="text-sm text-[var(--brand-accent)] hover:underline">
                View all →
              </Link>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
            {recentRuns.length > 0 ? (
              recentRuns.map((run) => <RunRow key={run.id} run={run} />)
            ) : (
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
            )}
          </div>
        </section>

      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
