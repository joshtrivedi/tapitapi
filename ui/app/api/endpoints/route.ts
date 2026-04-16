import { NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("provider_id");

  const query = providerId
    ? `SELECT e.*, p.name as provider_name
       FROM endpoints e
       JOIN providers p ON p.id = e.provider_id
       WHERE e.provider_id = ?
       ORDER BY e.created_at DESC`
    : `SELECT e.*, p.name as provider_name
       FROM endpoints e
       JOIN providers p ON p.id = e.provider_id
       ORDER BY p.name, e.method, e.path`;

  const endpoints = providerId
    ? db.prepare(query).all(providerId)
    : db.prepare(query).all();

  return NextResponse.json(endpoints);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { providerId, method, path, description } = body;

  if (!providerId || !method || !path) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = randomUUID();

  db.prepare(
    `INSERT INTO endpoints (id, provider_id, method, path, description)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, providerId, method.toUpperCase(), path, description ?? null);

  return NextResponse.json({ id }, { status: 201 });
}
