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
  const { endpointId, body: requestBody, queryParams } = await req.json();

  if (!endpointId) {
    return NextResponse.json({ error: "Missing endpointId" }, { status: 400 });
  }

  const endpoint = db
    .prepare(`SELECT * FROM endpoints WHERE id = ?`)
    .get(endpointId) as Endpoint | undefined;

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const provider = db
    .prepare(`SELECT * FROM providers WHERE id = ?`)
    .get(endpoint.provider_id) as Provider | undefined;

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Build auth headers
  const authConfig = JSON.parse(provider.auth_config) as Record<string, string>;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (provider.auth_type === "bearer") {
    headers["Authorization"] = `Bearer ${authConfig.token}`;
  } else if (provider.auth_type === "api-key") {
    const headerName = authConfig.headerName ?? "X-API-Key";
    headers[headerName] = authConfig.key;
  }

  const url = queryParams
    ? `${provider.base_url}${endpoint.path}?${queryParams}`
    : `${provider.base_url}${endpoint.path}`;
  const start = Date.now();
  let status = 0;
  let responseBody = "";
  let error: string | null = null;
  let testStatus: "passed" | "failed" | "error" = "passed";

  try {
    const res = await fetch(url, {
      method: endpoint.method,
      headers,
      body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined,
    });
    status = res.status;
    const contentType = res.headers.get("content-type") ?? "";
    responseBody = contentType.includes("application/json")
      ? JSON.stringify(await res.json(), null, 2)
      : await res.text();

    testStatus = status >= 200 && status < 300 ? "passed" : "failed";
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    testStatus = "error";
  }

  const latencyMs = Date.now() - start;
  const id = randomUUID();

  db.prepare(
    `INSERT INTO test_runs (id, provider_id, endpoint_id, status, status_code, latency_ms, response_body, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, provider.id, endpoint.id, testStatus, status || null, latencyMs, responseBody || null, error);

  return NextResponse.json({
    id,
    status: testStatus,
    statusCode: status,
    latencyMs,
    responseBody,
    error,
  });
}
