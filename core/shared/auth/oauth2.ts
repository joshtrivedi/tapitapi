export interface OAuth2Config {
  tokenUrl: string
  clientId: string
  clientSecret: string
}

export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getClientCredentialsToken(config: OAuth2Config): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
  })

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    throw new Error(`OAuth2 token fetch failed: ${res.status}`)
  }

  const data = (await res.json()) as TokenResponse
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return cachedToken.token
}

export function oauth2Auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}
