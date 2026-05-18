import { NextResponse } from "next/server";
import db from "@/lib/db";
import { randomUUID } from "crypto";

const TESLA_TOKEN_URL = "https://auth.tesla.com/oauth2/v3/token";
const TESLA_BASE_URL = "https://fleet-api.prd.na.vn.cloud.tesla.com";
const REDIRECT_URI = "http://localhost:3000/api/auth/tesla/callback";

interface OAuthSession {
  id: string;
  client_id: string;
  client_secret: string;
  vin: string;
}

const TESLA_ENDPOINTS = [
  { method: "GET",  path: "/api/1/vehicles",                                    description: "List all vehicles" },
  { method: "GET",  path: "/api/1/vehicles/{vin}/vehicle_data",                 description: "Full vehicle data (all endpoints)" },
  { method: "POST", path: "/api/1/vehicles/{vin}/wake_up",                      description: "Wake up vehicle" },
  { method: "GET",  path: "/api/1/vehicles/{vin}/vehicle_data?endpoints=charge_state",   description: "Charge state" },
  { method: "GET",  path: "/api/1/vehicles/{vin}/vehicle_data?endpoints=drive_state",    description: "Drive state" },
  { method: "GET",  path: "/api/1/vehicles/{vin}/vehicle_data?endpoints=climate_state",  description: "Climate state" },
  { method: "GET",  path: "/api/1/vehicles/{vin}/vehicle_data?endpoints=vehicle_state",  description: "Vehicle state" },
  { method: "GET",  path: "/api/1/vehicles/{vin}/vehicle_data?endpoints=location_data",  description: "Location data" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/charge_start",         description: "Start charging" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/charge_stop",          description: "Stop charging" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/set_charge_limit",     description: "Set charge limit" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/set_temps",            description: "Set climate temperatures" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/auto_conditioning_start", description: "Start climate preconditioning" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/auto_conditioning_stop",  description: "Stop climate" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/door_lock",            description: "Lock doors" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/door_unlock",          description: "Unlock doors" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/honk_horn",            description: "Honk horn" },
  { method: "POST", path: "/api/1/vehicles/{vin}/command/flash_lights",         description: "Flash lights" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `http://localhost:3000/providers/tesla/connect?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      "http://localhost:3000/providers/tesla/connect?error=missing_code"
    );
  }

  const session = db
    .prepare(`SELECT * FROM oauth_sessions WHERE id = ?`)
    .get(state) as OAuthSession | undefined;

  if (!session) {
    return NextResponse.redirect(
      "http://localhost:3000/providers/tesla/connect?error=invalid_state"
    );
  }

  // Exchange code for tokens
  let tokenData: { access_token: string; refresh_token: string; expires_in: number };
  try {
    const tokenRes = await fetch(TESLA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: session.client_id,
        client_secret: session.client_secret,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return NextResponse.redirect(
        `http://localhost:3000/providers/tesla/connect?error=${encodeURIComponent(err)}`
      );
    }

    tokenData = await tokenRes.json() as typeof tokenData;
  } catch (err) {
    return NextResponse.redirect(
      `http://localhost:3000/providers/tesla/connect?error=${encodeURIComponent(String(err))}`
    );
  }

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  const providerId = randomUUID();

  const authConfig = JSON.stringify({
    token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt,
    client_id: session.client_id,
    client_secret: session.client_secret,
    vin: session.vin,
  });

  // Upsert provider
  db.prepare(
    `INSERT OR REPLACE INTO providers (id, name, base_url, auth_type, auth_config)
     VALUES (?, 'Tesla', ?, 'oauth2', ?)`
  ).run(providerId, TESLA_BASE_URL, authConfig);

  // Seed endpoints with real VIN
  const insertEndpoint = db.prepare(
    `INSERT OR IGNORE INTO endpoints (id, provider_id, method, path, description)
     VALUES (?, ?, ?, ?, ?)`
  );
  const seedAll = db.transaction(() => {
    for (const ep of TESLA_ENDPOINTS) {
      insertEndpoint.run(
        randomUUID(),
        providerId,
        ep.method,
        ep.path.replace(/\{vin\}/g, session.vin),
        ep.description
      );
    }
  });
  seedAll();

  // Clean up session
  db.prepare(`DELETE FROM oauth_sessions WHERE id = ?`).run(state);

  return NextResponse.redirect(
    "http://localhost:3000/providers/tesla/connect?success=1"
  );
}
