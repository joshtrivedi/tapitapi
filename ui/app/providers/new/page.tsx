"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthType = "bearer" | "api-key" | "oauth2";

export default function NewProviderPage() {
  const router = useRouter();
  const [authType, setAuthType] = useState<AuthType>("bearer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const authConfig: Record<string, string> = {};
    if (authType === "bearer") {
      authConfig.token = form.get("bearerToken") as string;
    } else if (authType === "api-key") {
      authConfig.key = form.get("apiKey") as string;
      authConfig.headerName = (form.get("apiKeyHeader") as string) || "X-API-Key";
    } else {
      authConfig.tokenUrl = form.get("tokenUrl") as string;
      authConfig.clientId = form.get("clientId") as string;
      authConfig.clientSecret = form.get("clientSecret") as string;
    }

    const res = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        baseUrl: form.get("baseUrl"),
        authType,
        authConfig,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add provider");
      setSubmitting(false);
      return;
    }

    router.push("/providers");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-2">
            <Link href="/providers" className="hover:text-[var(--foreground)] transition-colors">
              Providers
            </Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">New</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Add Provider</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Configure a new API provider to start testing its endpoints.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--foreground)]">
              Provider Name <span className="text-[var(--brand-accent)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. my-api"
              className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          {/* Base URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--foreground)]">
              Base URL <span className="text-[var(--brand-accent)]">*</span>
            </label>
            <input
              type="url"
              name="baseUrl"
              required
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          {/* Auth type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--foreground)]">Authentication</label>
            <div className="flex gap-2">
              {(["bearer", "api-key", "oauth2"] as AuthType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAuthType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    authType === type
                      ? "bg-[var(--brand-primary)] text-white"
                      : "border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {type === "bearer" ? "Bearer Token" : type === "api-key" ? "API Key" : "OAuth2"}
                </button>
              ))}
            </div>
          </div>

          {/* Auth credentials */}
          {authType === "bearer" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--foreground)]">
                Bearer Token <span className="text-[var(--brand-accent)]">*</span>
              </label>
              <input
                type="password"
                name="bearerToken"
                required
                placeholder="your-token"
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
          )}

          {authType === "api-key" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[var(--foreground)]">
                  API Key <span className="text-[var(--brand-accent)]">*</span>
                </label>
                <input
                  type="password"
                  name="apiKey"
                  required
                  placeholder="your-api-key"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[var(--foreground)]">Header Name</label>
                <input
                  type="text"
                  name="apiKeyHeader"
                  placeholder="X-API-Key"
                  defaultValue="X-API-Key"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
            </div>
          )}

          {authType === "oauth2" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[var(--foreground)]">
                  Token URL <span className="text-[var(--brand-accent)]">*</span>
                </label>
                <input
                  type="url"
                  name="tokenUrl"
                  required
                  placeholder="https://auth.example.com/token"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[var(--foreground)]">
                  Client ID <span className="text-[var(--brand-accent)]">*</span>
                </label>
                <input
                  type="text"
                  name="clientId"
                  required
                  placeholder="client-id"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[var(--foreground)]">
                  Client Secret <span className="text-[var(--brand-accent)]">*</span>
                </label>
                <input
                  type="password"
                  name="clientSecret"
                  required
                  placeholder="client-secret"
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
            </div>
          )}

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
              disabled={submitting}
              className="px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Provider"}
            </button>
            <Link
              href="/providers"
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
