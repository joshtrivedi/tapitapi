"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

interface Endpoint {
  id: string;
  provider_id: string;
  provider_name: string;
  method: string;
  path: string;
  description: string | null;
}

interface BatchResult {
  site: string;
  status: "completed" | "failed" | "error" | "timeout";
  payload: string | null;
  error: string | null;
}

const SUGGESTED_SITES = [
  "https://paperswithcode.com/datasets?q=electric+vehicle",
  "https://zenodo.org/search?q=electric+vehicle+dataset",
  "https://ieee-dataport.org/search#k=electric%20vehicle",
  "https://data.world/search?q=electric+vehicle",
  "https://figshare.com/search?q=electric+vehicle+dataset",
  "https://huggingface.co/datasets?search=electric+vehicle",
  "https://archive.ics.uci.edu/datasets?search=electric",
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  error: "bg-red-100 text-red-700 border-red-200",
  timeout: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function BatchPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [asyncId, setAsyncId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [taskTemplate, setTaskTemplate] = useState("fetch all the datasets related to EV Datasets and return their titles and links");
  const [sites, setSites] = useState<string[]>(["", ""]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BatchResult[] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/endpoints")
      .then((r) => r.json())
      .then((data: Endpoint[]) => {
        setEndpoints(data);
        // Auto-select async and status endpoints if recognisable
        const asyncEp = data.find((e) => e.path.includes("async") && e.method === "POST");
        const statusEp = data.find((e) => e.path.includes("status") && e.method === "GET");
        if (asyncEp) setAsyncId(asyncEp.id);
        if (statusEp) setStatusId(statusEp.id);
      });
  }, []);

  // Elapsed timer while running
  useEffect(() => {
    if (!running) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  function addSite() {
    setSites((s) => [...s, ""]);
  }

  function removeSite(i: number) {
    setSites((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSite(i: number, val: string) {
    setSites((s) => s.map((v, idx) => (idx === i ? val : v)));
  }

  function fillSuggested() {
    setSites(SUGGESTED_SITES);
  }

  async function handleRun() {
    if (!asyncId || !statusId) return;
    const validSites = sites.filter((s) => s.trim());
    if (validSites.length === 0) return;

    setRunning(true);
    setResults(null);

    const tasks = validSites.map((site) => ({ site, task: taskTemplate }));

    const res = await fetch("/api/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asyncEndpointId: asyncId, statusEndpointId: statusId, tasks }),
    });

    const data = await res.json();
    setResults(data.results ?? []);
    setRunning(false);
  }

  const asyncEndpoints = endpoints.filter((e) => e.method === "POST");
  const statusEndpoints = endpoints.filter((e) => e.method === "GET");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-8">

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Batch Run</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Dispatch the same task to multiple websites in parallel and collect all results.
          </p>
        </div>

        {/* Config */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-5">

          {/* Endpoint selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Async (dispatch) endpoint</label>
              <select
                value={asyncId}
                onChange={(e) => setAsyncId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="">Select endpoint</option>
                {asyncEndpoints.map((e) => (
                  <option key={e.id} value={e.id}>{e.method} {e.path}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Status (poll) endpoint</label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="">Select endpoint</option>
                {statusEndpoints.map((e) => (
                  <option key={e.id} value={e.id}>{e.method} {e.path}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Task template */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Task instruction</label>
            <textarea
              value={taskTemplate}
              onChange={(e) => setTaskTemplate(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand-primary)] resize-y"
            />
            <p className="text-xs text-[var(--foreground-muted)]">
              Each task will be sent as: <span className="font-mono">go to {"{site}"} and {"{task}"}</span>
            </p>
          </div>

          {/* Sites */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Target websites</label>
              <button
                onClick={fillSuggested}
                className="text-xs text-[var(--brand-accent)] hover:underline"
              >
                Fill suggested sites
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {sites.map((site, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={site}
                    onChange={(e) => updateSite(i, e.target.value)}
                    placeholder="https://example.com/datasets?q=..."
                    className="flex-1 px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                  {sites.length > 1 && (
                    <button
                      onClick={() => removeSite(i)}
                      className="text-[var(--foreground-muted)] hover:text-red-500 transition-colors px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addSite}
              className="self-start text-sm text-[var(--brand-primary)] hover:underline"
            >
              + Add site
            </button>
          </div>

          {/* Run */}
          <button
            onClick={handleRun}
            disabled={running || !asyncId || !statusId || sites.filter((s) => s.trim()).length === 0}
            className="self-start px-6 py-2.5 rounded-md bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-[var(--brand-blue)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {running ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running… {elapsed}s
              </>
            ) : (
              `▶ Run ${sites.filter((s) => s.trim()).length} tasks`
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Results — {results.filter((r) => r.status === "completed").length}/{results.length} completed
            </h2>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
              {results.map((r) => (
                <div key={r.site} className="flex flex-col">
                  <button
                    onClick={() => setExpandedSite(expandedSite === r.site ? null : r.site)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--background)] transition-colors text-left w-full group"
                  >
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 capitalize ${statusColors[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                    <span className="text-sm font-mono text-[var(--foreground)] truncate flex-1">{r.site}</span>
                    <span className="text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] shrink-0">
                      {expandedSite === r.site ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedSite === r.site && (
                    <div className="px-5 pb-4 border-t border-[var(--border)] bg-[var(--background)]">
                      {r.error && (
                        <p className="mt-3 text-xs text-red-500 font-mono">{r.error}</p>
                      )}
                      {r.payload ? (
                        <pre className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-xs font-mono text-[var(--foreground)] overflow-auto max-h-96 whitespace-pre-wrap break-words">
                          {r.payload}
                        </pre>
                      ) : (
                        !r.error && <p className="mt-3 text-xs text-[var(--foreground-muted)]">No payload.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
