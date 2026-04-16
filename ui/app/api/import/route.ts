import { NextResponse } from "next/server";
import db from "@/lib/db";

interface ImportPayload {
  version?: number;
  providers?: Record<string, unknown>[];
  endpoints?: Record<string, unknown>[];
  test_runs?: Record<string, unknown>[];
}

export async function POST(req: Request) {
  let payload: ImportPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid import file" }, { status: 400 });
  }

  const counts = { providers: 0, endpoints: 0, test_runs: 0 };

  const run = db.transaction(() => {
    for (const row of payload.providers ?? []) {
      db.prepare(
        `INSERT OR REPLACE INTO providers (id, name, base_url, auth_type, auth_config, created_at, updated_at)
         VALUES (@id, @name, @base_url, @auth_type, @auth_config, @created_at, @updated_at)`
      ).run(row);
      counts.providers++;
    }

    for (const row of payload.endpoints ?? []) {
      db.prepare(
        `INSERT OR REPLACE INTO endpoints (id, provider_id, method, path, description, created_at)
         VALUES (@id, @provider_id, @method, @path, @description, @created_at)`
      ).run(row);
      counts.endpoints++;
    }

    for (const row of payload.test_runs ?? []) {
      db.prepare(
        `INSERT OR REPLACE INTO test_runs (id, provider_id, endpoint_id, status, status_code, latency_ms, response_body, error, ran_at)
         VALUES (@id, @provider_id, @endpoint_id, @status, @status_code, @latency_ms, @response_body, @error, @ran_at)`
      ).run(row);
      counts.test_runs++;
    }
  });

  try {
    run();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, imported: counts });
}
