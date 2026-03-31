import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = db.prepare(`DELETE FROM endpoints WHERE id = ?`).run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { method, path, description } = body;

  const result = db
    .prepare(
      `UPDATE endpoints
       SET method = COALESCE(?, method),
           path = COALESCE(?, path),
           description = COALESCE(?, description)
       WHERE id = ?`
    )
    .run(method?.toUpperCase() ?? null, path ?? null, description ?? null, id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
