import Navbar from "@/components/Navbar";
import EndpointRow from "@/components/EndpointRow";
import type { Endpoint } from "@/components/EndpointRow";
import Link from "next/link";
import db from "@/lib/db";

function getEndpoints(): Endpoint[] {
  return db
    .prepare(
      `SELECT e.*, p.name as provider_name
       FROM endpoints e
       JOIN providers p ON p.id = e.provider_id
       ORDER BY p.name, e.method, e.path`
    )
    .all() as Endpoint[];
}

function groupByProvider(endpoints: Endpoint[]): Record<string, Endpoint[]> {
  return endpoints.reduce<Record<string, Endpoint[]>>((acc, ep) => {
    const key = ep.provider_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ep);
    return acc;
  }, {});
}

export default function EndpointsPage() {
  const endpoints = getEndpoints();
  const grouped = groupByProvider(endpoints);
  const providerNames = Object.keys(grouped);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Endpoints</h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              All configured endpoints across your providers.
            </p>
          </div>
          <Link
            href="/endpoints/new"
            className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors"
          >
            + Add Endpoint
          </Link>
        </div>

        {/* Endpoint groups or empty state */}
        {providerNames.length > 0 ? (
          <div className="flex flex-col gap-6">
            {providerNames.map((providerName) => (
              <div key={providerName} className="flex flex-col gap-2">
                <h2 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest">
                  {providerName}
                </h2>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {grouped[providerName].map((endpoint) => (
                    <EndpointRow key={endpoint.id} endpoint={endpoint} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] opacity-30" />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[var(--foreground)]">No endpoints yet</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Add your first endpoint to a provider to get started.
              </p>
            </div>
            <Link
              href="/endpoints/new"
              className="mt-2 px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors"
            >
              Add Endpoint
            </Link>
          </div>
        )}

      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
