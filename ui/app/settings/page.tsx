"use client";

import Navbar from "@/components/Navbar";
import { useRef, useState } from "react";

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success?: boolean;
    imported?: { providers: number; endpoints: number; test_runs: number };
    error?: string;
  } | null>(null);

  function handleExport() {
    window.location.href = "/api/export";
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      setImportResult(data);
    } catch {
      setImportResult({ error: "Failed to read or parse file." });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Manage your tapitapi configuration.
          </p>
        </div>

        {/* Export */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-[var(--foreground)]">Export</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Download all providers, endpoints, and test results as a JSON file.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="self-start px-5 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors"
          >
            Download Export
          </button>
        </div>

        {/* Import */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-[var(--foreground)]">Import</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Restore from a previously exported JSON file. Existing records with the same ID will be overwritten.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="self-start px-5 py-2.5 rounded-md border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? "Importing..." : "Choose File"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {importResult && (
            importResult.error ? (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {importResult.error}
              </p>
            ) : (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex flex-col gap-0.5">
                <span className="font-bold">Import successful</span>
                <span>
                  {importResult.imported?.providers} providers · {importResult.imported?.endpoints} endpoints · {importResult.imported?.test_runs} test runs
                </span>
              </div>
            )
          )}
        </div>

      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
