"use client";

import { useRouter } from "next/navigation";

export interface Endpoint {
  id: string;
  provider_id: string;
  provider_name: string;
  method: string;
  path: string;
  description?: string;
  created_at: string;
}

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  const router = useRouter();
  const color = methodColors[endpoint.method] ?? "bg-gray-100 text-gray-700";

  async function handleDelete() {
    if (!confirm(`Delete ${endpoint.method} ${endpoint.path}?`)) return;
    await fetch(`/api/endpoints/${endpoint.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-[var(--background)] transition-colors group">
      <div className="flex items-center gap-4 min-w-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono shrink-0 ${color}`}>
          {endpoint.method}
        </span>
        <span className="text-sm font-mono text-[var(--foreground)] truncate">
          {endpoint.path}
        </span>
        {endpoint.description && (
          <span className="text-xs text-[var(--foreground-muted)] truncate hidden sm:block">
            {endpoint.description}
          </span>
        )}
      </div>
      <button
        onClick={handleDelete}
        className="text-xs text-[var(--foreground-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-4"
      >
        Remove
      </button>
    </div>
  );
}
