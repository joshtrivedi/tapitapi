import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const providers = db.prepare(`SELECT * FROM providers ORDER BY created_at`).all();
  const endpoints = db.prepare(`SELECT * FROM endpoints ORDER BY created_at`).all();
  const test_runs = db.prepare(`SELECT * FROM test_runs ORDER BY ran_at`).all();

  const payload = {
    version: 1,
    exported_at: new Date().toISOString(),
    providers,
    endpoints,
    test_runs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tapitapi-export-${Date.now()}.json"`,
    },
  });
}
