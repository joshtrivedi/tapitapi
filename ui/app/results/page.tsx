import Navbar from "@/components/Navbar";
import RunRow from "@/components/RunRow";
import db from "@/lib/db";

export interface TestRun {
  id: string;
  provider_name: string;
  method: string | null;
  path: string | null;
  status: "passed" | "failed" | "error";
  status_code: number | null;
  latency_ms: number | null;
  response_body: string | null;
  error: string | null;
  ran_at: string;
}

function getRuns(): TestRun[] {
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
       LIMIT 200`
    )
    .all() as TestRun[];
}

const statusStyle: Record<string, string> = {
  passed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  error: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export { statusStyle };

export default function ResultsPage() {
  const runs = getRuns();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Results</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Recent test runs across all providers.
          </p>
        </div>

        {/* Runs list */}
        {runs.length > 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
            {runs.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] opacity-30" />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[var(--foreground)]">No results yet</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Run a test from the Tests page to see results here.
              </p>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
