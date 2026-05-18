import { NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";

const TESLA_AUTH_URL = "https://auth.tesla.com/oauth2/v3/authorize";
const SCOPES = "openid offline_access vehicle_device_data vehicle_cmds vehicle_charging_cmds";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/auth/callback/tesla`;

export async function POST(req: Request) {
  const { clientId, clientSecret, vin } = await req.json();

  if (!clientId || !clientSecret || !vin) {
    return NextResponse.json({ error: "clientId, clientSecret and vin are required" }, { status: 400 });
  }

  const state = randomUUID();

  db.prepare(
    `INSERT INTO oauth_sessions (id, client_id, client_secret, vin) VALUES (?, ?, ?, ?)`
  ).run(state, clientId, clientSecret, vin.trim().toUpperCase());

  const params = new URLSearchParams({
    client_id: clientId,
    locale: "en-US",
    prompt: "login",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    state,
  });

  return NextResponse.json({ authUrl: `${TESLA_AUTH_URL}?${params}` });
}
