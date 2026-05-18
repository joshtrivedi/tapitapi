import { NextResponse } from "next/server";
import db from "@/lib/db";

const TESLA_TOKEN_URL = "https://auth.tesla.com/oauth2/v3/token";

interface Provider {
  id: string;
  auth_config: string;
}

interface AuthConfig {
  token: string;
  refresh_token: string;
  expires_at: string;
  client_id: string;
  client_secret: string;
  vin: string;
}

export async function POST(req: Request) {
  const { providerId } = await req.json();

  const provider = db.prepare(`SELECT * FROM providers WHERE id = ?`).get(providerId) as Provider | undefined;
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const authConfig = JSON.parse(provider.auth_config) as AuthConfig;

  const tokenRes = await fetch(TESLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: authConfig.client_id,
      client_secret: authConfig.client_secret,
      refresh_token: authConfig.refresh_token,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  const data = await tokenRes.json() as { access_token: string; refresh_token?: string; expires_in: number };

  const newConfig: AuthConfig = {
    ...authConfig,
    token: data.access_token,
    refresh_token: data.refresh_token ?? authConfig.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };

  db.prepare(`UPDATE providers SET auth_config = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(JSON.stringify(newConfig), providerId);

  return NextResponse.json({ success: true, expiresAt: newConfig.expires_at });
}
