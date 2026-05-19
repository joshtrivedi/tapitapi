import { NextResponse } from "next/server";

const TESLA_TOKEN_URL = "https://auth.tesla.com/oauth2/v3/token";
const TESLA_BASE_URL = "https://fleet-api.prd.eu.vn.cloud.tesla.com";

export async function POST(req: Request) {
  const { clientId, clientSecret, domain } = await req.json();

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "clientId and clientSecret are required" }, { status: 400 });
  }

  // Step 1: get partner token via client_credentials
  const tokenRes = await fetch(TESLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "openid vehicle_device_data vehicle_cmds vehicle_charging_cmds",
      audience: TESLA_BASE_URL,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: `Token fetch failed: ${err}` }, { status: 502 });
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  // Step 2: register partner account
  const regRes = await fetch(`${TESLA_BASE_URL}/api/1/partner_accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify({ domain: domain ?? "localhost" }),
  });

  const regData = await regRes.json();

  if (!regRes.ok) {
    return NextResponse.json({ error: JSON.stringify(regData) }, { status: 502 });
  }

  return NextResponse.json({ success: true, data: regData });
}
