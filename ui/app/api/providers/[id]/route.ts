import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const provider = db
    .prepare(`SELECT * FROM providers WHERE id = ?`)
    .get(id);

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = db.prepare(`DELETE FROM providers WHERE id = ?`).run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, baseUrl, authType, authConfig } = body;

  const result = db
    .prepare(
      `UPDATE providers
       SET name = COALESCE(?, name),
           base_url = COALESCE(?, base_url),
           auth_type = COALESCE(?, auth_type),
           auth_config = COALESCE(?, auth_config),
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(
      name ?? null,
      baseUrl ?? null,
      authType ?? null,
      authConfig ? JSON.stringify(authConfig) : null,
      id
    );

  if (result.changes === 0) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
