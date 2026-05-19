import { NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const providers = db
    .prepare(
      `SELECT id, name, base_url, auth_type, created_at, updated_at
       FROM providers ORDER BY created_at DESC`
    )
    .all();

  return NextResponse.json(providers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, baseUrl, authType, authConfig } = body;

  if (!name || !baseUrl || !authType || !authConfig) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = randomUUID();

  db.prepare(
    `INSERT INTO providers (id, name, base_url, auth_type, auth_config)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, name, baseUrl, authType, JSON.stringify(authConfig));

  return NextResponse.json({ id }, { status: 201 });
}
