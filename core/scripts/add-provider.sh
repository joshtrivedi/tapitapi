#!/usr/bin/env bash
set -euo pipefail

PROVIDER_NAME="${1:?Usage: ./scripts/add-provider.sh <provider-name>}"
BASE="providers/${PROVIDER_NAME}"

echo "Scaffolding provider: ${PROVIDER_NAME}"

mkdir -p "${BASE}/endpoints" "${BASE}/tests"
mkdir -p "fixtures/${PROVIDER_NAME}"

cat > "${BASE}/config.ts" <<EOF
import 'dotenv/config'
import { bearerAuth } from '../../shared/auth/bearer.js'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(\`Missing required environment variable: \${key}\`)
  return value
}

export const PROVIDER = '${PROVIDER_NAME}'

export function getConfig() {
  return {
    baseUrl: process.env['${PROVIDER_NAME^^}_BASE_URL'] ?? '',
    authHeaders: bearerAuth(requireEnv('${PROVIDER_NAME^^}_API_KEY')),
  }
}
EOF

cat > "${BASE}/schemas.ts" <<EOF
import { z } from 'zod'

// TODO: define zod schemas for ${PROVIDER_NAME} responses
export const ExampleSchema = z.object({
  id: z.string(),
})

export type Example = z.infer<typeof ExampleSchema>
EOF

cat > "${BASE}/README.md" <<EOF
# ${PROVIDER_NAME}

## Base URL


## Authentication


## Rate Limits


## Known Quirks


## Endpoints

| Method | Path | Description |
|--------|------|-------------|
EOF

echo "" >> .env.example
echo "# --- ${PROVIDER_NAME} ---" >> .env.example
echo "${PROVIDER_NAME^^}_API_KEY=" >> .env.example
echo "${PROVIDER_NAME^^}_BASE_URL=" >> .env.example

echo "Scaffolded ${BASE}/"
echo "Next: fill in config.ts, schemas.ts, README.md, and add endpoints + tests."
