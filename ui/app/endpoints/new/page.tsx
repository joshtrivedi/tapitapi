"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface Provider {
  id: string;
  name: string;
}

export default function NewEndpointPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((data) => setProviders(data));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/endpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: form.get("providerId"),
        method: form.get("method"),
        path: form.get("path"),
        description: form.get("description") || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add endpoint");
      setSubmitting(false);
      return;
    }

    router.push("/endpoints");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-2">
            <Link href="/endpoints" className="hover:text-[var(--foreground)] transition-colors">
              Endpoints
            </Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">New</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Add Endpoint</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Define an endpoint to test against a provider.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Provider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--foreground)]">
              Provider <span className="text-[var(--brand-accent)]">*</span>
            </label>
            {providers.length === 0 ? (
              <p className="text-sm text-[var(--foreground-muted)]">
                No providers found.{" "}
                <Link href="/providers/new" className="text-[var(--brand-accent)] hover:underline">
                  Add one first.
                </Link>
              </p>
            ) : (
              <select
                name="providerId"
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              >
                <option value="">Select a provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Method + Path */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 w-32">
              <label className="text-sm font-bold text-[var(--foreground)]">
                Method <span className="text-[var(--brand-accent)]">*</span>
              </label>
              <select
                name="method"
                required
                defaultValue="GET"
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-bold text-[var(--foreground)]">
                Path <span className="text-[var(--brand-accent)]">*</span>
              </label>
              <input
                type="text"
                name="path"
                required
                placeholder="/api/v1/resource"
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--foreground)]">
              Description <span className="text-[var(--foreground-muted)] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="description"
              placeholder="What does this endpoint do?"
              className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || providers.length === 0}
              className="px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Endpoint"}
            </button>
            <Link
              href="/endpoints"
              className="px-5 py-2.5 rounded-md border border-[var(--border)] text-[var(--foreground)] text-sm hover:bg-[var(--surface)] transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
