import { NextResponse } from "next/server";
import { generateKeyPairSync } from "crypto";
import db from "@/lib/db";

export async function POST() {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  // Store private key in DB for later command signing
  db.prepare(
    `INSERT OR REPLACE INTO oauth_sessions (id, client_id, client_secret, vin)
     VALUES ('tesla_keypair', '__privkey__', ?, '__none__')`
  ).run(privateKey);

  return NextResponse.json({ publicKey, privateKey });
}
