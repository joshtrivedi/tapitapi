import Navbar from "@/components/Navbar";
import ProviderCard from "@/components/ProviderCard";
import type { Provider } from "@/components/ProviderCard";
import Link from "next/link";
import db from "@/lib/db";

function getProviders(): Provider[] {
  const rows = db
    .prepare(
      `SELECT id, name, base_url as baseUrl, auth_type as authType,
              (SELECT COUNT(*) FROM endpoints WHERE provider_id = providers.id) as endpointCount,
              (SELECT ran_at FROM test_runs WHERE provider_id = providers.id ORDER BY ran_at DESC LIMIT 1) as lastRun
       FROM providers ORDER BY created_at DESC`
    )
    .all() as Provider[];
  return rows;
}

export default function ProvidersPage() {
  const providers = getProviders();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Providers</h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              Manage your API providers and their configurations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/providers/tesla/connect"
              className="px-4 py-2 rounded-md border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--surface)] transition-colors"
            >
              + Tesla
            </Link>
            <Link
              href="/providers/new"
              className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors"
            >
              + Add Provider
            </Link>
          </div>
        </div>

        {/* Provider grid or empty state */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] opacity-30" />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[var(--foreground)]">No providers yet</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Add your first provider to start testing APIs.
              </p>
            </div>
            <Link
              href="/providers/new"
              className="mt-2 px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors"
            >
              Add Provider
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
