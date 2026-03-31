"use client";

import { useState } from "react";
import type { TestRun } from "@/app/results/page";

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

const statusStyle: Record<string, string> = {
  passed: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  error: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

function formatDate(iso: string) {
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function RunRow({ run }: { run: TestRun }) {
  const [expanded, setExpanded] = useState(false);
  const methodColor = run.method ? (methodColors[run.method] ?? "bg-gray-100 text-gray-700") : "";

  return (
    <div className="flex flex-col">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--background)] transition-colors text-left w-full group"
      >
        {/* Status badge */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 capitalize ${statusStyle[run.status]}`}>
          {run.status}
        </span>

        {/* Method + path */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {run.method && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono shrink-0 ${methodColor}`}>
              {run.method}
            </span>
          )}
          <span className="text-sm font-mono text-[var(--foreground)] truncate">
            {run.path ?? "—"}
          </span>
          <span className="text-xs text-[var(--foreground-muted)] shrink-0 hidden sm:block">
            {run.provider_name}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--foreground-muted)]">
          {run.status_code != null && run.status_code > 0 && (
            <span>HTTP {run.status_code}</span>
          )}
          {run.latency_ms != null && <span>{run.latency_ms}ms</span>}
          <span className="hidden md:block">{formatDate(run.ran_at)}</span>
          <span className="text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] transition-colors">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-4 flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--background)]">
          {run.error && (
            <div className="mt-3">
              <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">Error</p>
              <p className="text-xs text-red-500 font-mono">{run.error}</p>
            </div>
          )}
          {run.response_body ? (
            <div className="mt-3">
              <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">Response</p>
              <pre className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-xs font-mono text-[var(--foreground)] overflow-auto max-h-80 whitespace-pre-wrap break-words">
                {run.response_body}
              </pre>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[var(--foreground-muted)]">No response body.</p>
          )}
          <p className="text-xs text-[var(--foreground-muted)]">{formatDate(run.ran_at)}</p>
        </div>
      )}
    </div>
  );
}
