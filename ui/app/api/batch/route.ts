import { NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";

interface Provider {
  id: string;
  name: string;
  base_url: string;
  auth_type: "bearer" | "api-key" | "oauth2";
  auth_config: string;
}

interface Endpoint {
  id: string;
  provider_id: string;
  method: string;
  path: string;
}

export async function POST(req: Request) {
  const { asyncEndpointId, statusEndpointId, tasks } = await req.json();
  // tasks: Array<{ site: string; task: string }>

  if (!asyncEndpointId || !statusEndpointId || !Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const asyncEndpoint = db.prepare(`SELECT * FROM endpoints WHERE id = ?`).get(asyncEndpointId) as Endpoint | undefined;
  const statusEndpoint = db.prepare(`SELECT * FROM endpoints WHERE id = ?`).get(statusEndpointId) as Endpoint | undefined;

  if (!asyncEndpoint || !statusEndpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const provider = db.prepare(`SELECT * FROM providers WHERE id = ?`).get(asyncEndpoint.provider_id) as Provider | undefined;
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const authConfig = JSON.parse(provider.auth_config) as Record<string, string>;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider.auth_type === "bearer") {
    headers["Authorization"] = `Bearer ${authConfig.token}`;
  } else if (provider.auth_type === "api-key") {
    headers[authConfig.headerName ?? "X-API-Key"] = authConfig.key;
  }

  const asyncUrl = `${provider.base_url}${asyncEndpoint.path}`;
  const statusBase = `${provider.base_url}${statusEndpoint.path}`;

  // Dispatch all tasks in parallel
  const dispatched = await Promise.all(
    tasks.map(async (t: { site: string; task: string }) => {
      try {
        const res = await fetch(asyncUrl, {
          method: asyncEndpoint.method,
          headers,
          body: JSON.stringify({ task: `go to ${t.site} and ${t.task}` }),
        });
        const data = await res.json() as { task_id?: string; error?: string };
        return { site: t.site, task_id: data.task_id ?? null, error: data.error ?? null };
      } catch (err) {
        return { site: t.site, task_id: null, error: err instanceof Error ? err.message : "Dispatch failed" };
      }
    })
  );

  // Poll all task_ids until completed or failed (max 10 min, 5s interval)
  const results: Record<string, { site: string; status: string; payload: string | null; error: string | null }> = {};
  const pending = dispatched.filter((d) => d.task_id !== null);

  // Immediate failures
  dispatched.filter((d) => d.task_id === null).forEach((d) => {
    results[d.site] = { site: d.site, status: "error", payload: null, error: d.error };
  });

  const MAX_POLLS = 120; // 120 × 5s = 10 min
  const INTERVAL_MS = 5000;

  for (let i = 0; i < MAX_POLLS && pending.length > 0; i++) {
    await new Promise((r) => setTimeout(r, INTERVAL_MS));

    const toRemove: number[] = [];
    await Promise.all(
      pending.map(async (d, idx) => {
        try {
          const res = await fetch(`${statusBase}?task_id=${d.task_id}`, { headers });
          const data = await res.json() as { status?: string; payload?: string; success?: boolean };
          if (data.status === "completed" || data.success === true) {
            results[d.site] = { site: d.site, status: "completed", payload: data.payload ?? JSON.stringify(data), error: null };
            toRemove.push(idx);
          } else if (data.status === "failed" || data.status === "error") {
            results[d.site] = { site: d.site, status: "failed", payload: null, error: JSON.stringify(data) };
            toRemove.push(idx);
          }
        } catch (err) {
          results[d.site] = { site: d.site, status: "error", payload: null, error: err instanceof Error ? err.message : "Poll failed" };
          toRemove.push(idx);
        }
      })
    );

    toRemove.sort((a, b) => b - a).forEach((idx) => pending.splice(idx, 1));
  }

  // Anything still pending timed out
  pending.forEach((d) => {
    results[d.site] = { site: d.site, status: "timeout", payload: null, error: "Timed out after 10 minutes" };
  });

  // Persist every result to test_runs
  const insertRun = db.prepare(
    `INSERT INTO test_runs (id, provider_id, endpoint_id, status, status_code, latency_ms, response_body, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertAll = db.transaction(() => {
    for (const r of Object.values(results)) {
      const dbStatus = r.status === "completed" ? "passed" : r.status === "timeout" ? "error" : "failed";
      insertRun.run(
        randomUUID(),
        provider.id,
        statusEndpoint.id,
        dbStatus,
        r.status === "completed" ? 200 : null,
        null,
        r.payload,
        r.error ? `[batch: ${r.site}] ${r.error}` : `[batch: ${r.site}]`
      );
    }
  });
  insertAll();

  return NextResponse.json({ results: Object.values(results) });
}
