"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

interface Provider {
  id: string;
  name: string;
}

interface Endpoint {
  id: string;
  provider_id: string;
  method: string;
  path: string;
  description?: string;
}

interface RunResult {
  id: string;
  status: "passed" | "failed" | "error";
  statusCode: number;
  latencyMs: number;
  responseBody: string;
  error?: string;
}

const methodColors: Record<string, string> = {
  GET: "text-green-600",
  POST: "text-blue-600",
  PUT: "text-yellow-600",
  PATCH: "text-orange-500",
  DELETE: "text-red-600",
};

const statusStyle: Record<string, string> = {
  passed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  error: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const HAS_BODY = ["POST", "PUT", "PATCH"];

export default function TestsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => {
    fetch("/api/providers").then((r) => r.json()).then(setProviders);
  }, []);

  useEffect(() => {
    if (!selectedProvider) {
      setEndpoints([]);
      setSelectedEndpoint("");
      return;
    }
    fetch(`/api/endpoints?provider_id=${selectedProvider}`)
      .then((r) => r.json())
      .then((data) => {
        setEndpoints(data);
        setSelectedEndpoint("");
        setRequestBody("");
      });
  }, [selectedProvider]);

  // Reset body/params when endpoint changes
  useEffect(() => {
    setRequestBody("");
    setBodyError(null);
    setQueryParams("");
    setResult(null);
  }, [selectedEndpoint]);

  async function handleRun() {
    if (!selectedEndpoint) return;

    // Validate JSON body if provided
    let parsedBody: unknown = undefined;
    if (requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        setBodyError("Invalid JSON — please fix before running.");
        return;
      }
    }

    setBodyError(null);
    setRunning(true);
    setResult(null);

    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpointId: selectedEndpoint,
        body: parsedBody,
        queryParams: queryParams.trim() || undefined,
      }),
    });

    const data = await res.json();
    setResult(data);
    setRunning(false);
  }

  const selectedEp = endpoints.find((e) => e.id === selectedEndpoint);
  const showBody = selectedEp && HAS_BODY.includes(selectedEp.method);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tests</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Select a provider and endpoint, then fire a request.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Provider select */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              >
                <option value="">Select provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Endpoint select */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                Endpoint
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                disabled={!selectedProvider || endpoints.length === 0}
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-colors disabled:opacity-50"
              >
                <option value="">Select endpoint</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.method} {ep.path}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected endpoint preview */}
          {selectedEp && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[var(--background)] border border-[var(--border)]">
              <span className={`text-xs font-bold font-mono ${methodColors[selectedEp.method] ?? ""}`}>
                {selectedEp.method}
              </span>
              <span className="text-sm font-mono text-[var(--foreground)]">{selectedEp.path}</span>
              {selectedEp.description && (
                <span className="text-xs text-[var(--foreground-muted)] ml-auto hidden sm:block">{selectedEp.description}</span>
              )}
            </div>
          )}

          {/* Query params — always shown when endpoint is selected */}
          {selectedEp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                Query Params <span className="font-normal normal-case">(optional, e.g. task_id=abc&limit=10)</span>
              </label>
              <input
                type="text"
                value={queryParams}
                onChange={(e) => setQueryParams(e.target.value)}
                placeholder="key=value&key2=value2"
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
          )}

          {/* Request body — only for POST/PUT/PATCH */}
          {showBody && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                Request Body <span className="font-normal normal-case">(JSON, optional)</span>
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => { setRequestBody(e.target.value); setBodyError(null); }}
                rows={6}
                placeholder={'{\n  "key": "value"\n}'}
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-mono placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors resize-y"
              />
              {bodyError && (
                <p className="text-xs text-red-500">{bodyError}</p>
              )}
            </div>
          )}

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!selectedEndpoint || running}
            className="self-start px-6 py-2.5 rounded-md bg-[var(--brand-accent)] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {running ? "Running..." : "▶ Run"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-4 px-4 py-3 rounded-lg border text-sm font-medium ${statusStyle[result.status]}`}>
              <span className="capitalize font-bold">{result.status}</span>
              {result.statusCode > 0 && <span>HTTP {result.statusCode}</span>}
              <span>{result.latencyMs}ms</span>
              {result.error && <span className="ml-auto truncate">{result.error}</span>}
            </div>

            {result.responseBody && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                  Response
                </span>
                <pre className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-xs font-mono text-[var(--foreground)] overflow-auto max-h-96 whitespace-pre-wrap break-words">
                  {result.responseBody}
                </pre>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--foreground-muted)]">
        tapitapi — API Tester for everyone
      </footer>
    </div>
  );
}
