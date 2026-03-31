export interface RequestLog {
  provider: string
  method: string
  endpoint: string
  status: number
  latencyMs: number
  requestId?: string
  timestamp: string
}

const REDACTED = '[REDACTED]'

const SENSITIVE_KEYS = ['authorization', 'x-api-key', 'api_key', 'token', 'password', 'secret']

export function redact(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    result[key] = SENSITIVE_KEYS.includes(key.toLowerCase()) ? REDACTED : value
  }
  return result
}

export function logRequest(entry: RequestLog): void {
  console.log(JSON.stringify(entry))
}
