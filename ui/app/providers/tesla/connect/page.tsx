"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function TeslaConnectForm() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const errorParam = searchParams.get("error");

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [vin, setVin] = useState("5YJ3E7EB0LF765703");
  const [domain, setDomain] = useState("predeeption.com");
  const [loading, setLoading] = useState(false);

  const [generatingKey, setGeneratingKey] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyGenError, setKeyGenError] = useState<string | null>(null);

  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(errorParam);

  async function handleKeygen() {
    setGeneratingKey(true);
    setKeyGenError(null);
    const res = await fetch("/api/auth/tesla/keygen", { method: "POST" });
    const data = await res.json() as { publicKey?: string; error?: string };
    if (!res.ok || !data.publicKey) {
      setKeyGenError(data.error ?? "Key generation failed");
    } else {
      setPublicKey(data.publicKey);
    }
    setGeneratingKey(false);
  }

  function copyKey() {
    if (publicKey) navigator.clipboard.writeText(publicKey);
  }

  async function handleRegister() {
    if (!clientId || !clientSecret) return;
    setRegistering(true);
    setRegisterError(null);

    const res = await fetch("/api/auth/tesla/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret, domain }),
    });

    const data = await res.json() as { success?: boolean; error?: string };
    if (!res.ok || !data.success) {
      setRegisterError(data.error ?? "Registration failed");
    } else {
      setRegistered(true);
    }
    setRegistering(false);
  }

  async function handleConnect() {
    if (!clientId || !clientSecret || !vin) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/tesla/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret, vin }),
    });

    const data = await res.json() as { authUrl?: string; error?: string };
    if (!res.ok || !data.authUrl) {
      setError(data.error ?? "Failed to generate auth URL");
      setLoading(false);
      return;
    }

    window.location.href = data.authUrl;
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">✓</div>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-green-800">Tesla connected successfully</p>
          <p className="text-sm text-green-700">Provider and endpoints have been added to your workspace.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/endpoints" className="px-4 py-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors">
            View Endpoints
          </Link>
          <Link href="/tests" className="px-4 py-2 rounded-md border border-[var(--border)] text-[var(--foreground)] text-sm hover:bg-[var(--surface)] transition-colors">
            Run Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-6">

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Credentials */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[var(--foreground)]">Client ID <span className="text-[var(--brand-accent)]">*</span></label>
          <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)}
            placeholder="your-tesla-client-id"
            className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[var(--foreground)]">Client Secret <span className="text-[var(--brand-accent)]">*</span></label>
          <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)}
            placeholder="your-tesla-client-secret"
            className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[var(--foreground)]">Vehicle VIN <span className="text-[var(--brand-accent)]">*</span></label>
          <input type="text" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="5YJ3E7EB0LF765703"
            className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[var(--foreground)]">Partner Domain <span className="text-[var(--brand-accent)]">*</span></label>
          <input type="text" value={domain} onChange={(e) => setDomain(e.target.value.toLowerCase())}
            placeholder="yourdomain.com"
            className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)]" />
          <p className="text-xs text-[var(--foreground-muted)]">No https://, lowercase.</p>
        </div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 flex flex-col gap-1 text-xs text-[var(--foreground-muted)]">
        <span className="font-bold text-[var(--foreground)]">Redirect URI</span>
        <code className="font-mono">http://localhost:3000/api/auth/callback/tesla</code>
        <span>Must be registered in your Tesla developer application.</span>
      </div>

      <div className="border-t border-[var(--border)]" />

      {/* Step 1 — Generate key */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-[var(--foreground)]">Step 1 — Generate public key</span>
            <span className="text-xs text-[var(--foreground-muted)]">
              Tesla requires a public key hosted at{" "}
              <code className="font-mono">https://{domain}/.well-known/appspecific/com.tesla.3p.public-key.pem</code>
            </span>
          </div>
          {publicKey && <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded shrink-0 ml-3">Generated</span>}
        </div>

        {keyGenError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{keyGenError}</p>}

        {!publicKey ? (
          <button onClick={handleKeygen} disabled={generatingKey}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {generatingKey ? <><span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Generating…</> : "Generate Key Pair"}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <pre className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs font-mono text-[var(--foreground)] overflow-auto whitespace-pre-wrap break-all">{publicKey}</pre>
            <div className="flex items-center gap-2">
              <button onClick={copyKey}
                className="text-xs text-[var(--brand-accent)] hover:underline">
                Copy public key
              </button>
              <span className="text-xs text-[var(--foreground-muted)]">—</span>
              <span className="text-xs text-[var(--foreground-muted)]">
                Host this file at <code className="font-mono">https://{domain}/.well-known/appspecific/com.tesla.3p.public-key.pem</code>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — Register */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-[var(--foreground)]">Step 2 — Register partner account</span>
            <span className="text-xs text-[var(--foreground-muted)]">Run after the public key is live at the URL above.</span>
          </div>
          {registered && <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded shrink-0 ml-3">Registered</span>}
        </div>

        {registerError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{registerError}</p>}

        {!registered && (
          <button onClick={handleRegister} disabled={registering || !clientId || !clientSecret || !publicKey}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {registering ? <><span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Registering…</> : "Register App"}
          </button>
        )}
      </div>

      {/* Step 3 — OAuth */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-[var(--foreground)]">Step 3 — Authorize with Tesla</span>
          <span className="text-xs text-[var(--foreground-muted)]">Complete steps 1 and 2 first.</span>
        </div>
        <button onClick={handleConnect} disabled={loading || !clientId || !clientSecret || !vin || !registered}
          className="self-start flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Redirecting to Tesla…</> : "Connect with Tesla →"}
        </button>
      </div>

    </div>
  );
}

export default function TeslaConnectPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-2">
            <Link href="/providers" className="hover:text-[var(--foreground)]">Providers</Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">Tesla</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Connect Tesla</h1>
          <p className="text-sm text-[var(--foreground-muted)]">3-step setup — key, register, authorize.</p>
        </div>
        <Suspense>
          <TeslaConnectForm />
        </Suspense>
      </main>
      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
