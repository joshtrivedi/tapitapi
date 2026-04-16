"use client";

import Link from "next/link";

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  authType: "bearer" | "api-key" | "oauth2";
  endpointCount: number;
  lastRun?: string;
  status?: "passing" | "failing" | "unknown";
}

const statusColors: Record<string, string> = {
  passing: "bg-green-500",
  failing: "bg-red-500",
  unknown: "bg-[var(--foreground-muted)]",
};

const statusLabels: Record<string, string> = {
  passing: "Passing",
  failing: "Failing",
  unknown: "Unknown",
};

export default function ProviderCard({ provider }: { provider: Provider }) {
  const status = provider.status ?? "unknown";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4 hover:border-[var(--brand-primary)] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-[var(--foreground)]">{provider.name}</h3>
          <span className="text-xs text-[var(--foreground-muted)] truncate max-w-[200px]">
            {provider.baseUrl}
          </span>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium text-white px-2 py-0.5 rounded-full ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
        <span>{provider.endpointCount} endpoint{provider.endpointCount !== 1 ? "s" : ""}</span>
        <span className="capitalize">{provider.authType}</span>
        {provider.lastRun && <span>Last run {provider.lastRun}</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/providers/${provider.id}`}
          className="text-xs px-3 py-1.5 rounded-md bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-blue)] transition-colors"
        >
          View
        </Link>
        <Link
          href={`/providers/${provider.id}/edit`}
          className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
