import type { ZodSchema } from 'zod'
import type { ApiResponse } from './http-client.js'

export function assertStatus(res: ApiResponse, expected: number): void {
  if (res.status !== expected) {
    throw new Error(`Expected status ${expected}, got ${res.status}. Body: ${JSON.stringify(res.body)}`)
  }
}

export function assertSchema<T>(body: unknown, schema: ZodSchema<T>): T {
  return schema.parse(body)
}

export function assertLatency(res: ApiResponse, maxMs: number): void {
  if (res.latencyMs > maxMs) {
    throw new Error(`Latency ${res.latencyMs}ms exceeded SLA of ${maxMs}ms`)
  }
}

export function assertErrorShape(body: unknown): void {
  if (typeof body !== 'object' || body === null) {
    throw new Error(`Expected error response to be an object, got ${typeof body}`)
  }
  const b = body as Record<string, unknown>
  if (!('error' in b) && !('message' in b)) {
    throw new Error(`Error response missing 'error' or 'message' field: ${JSON.stringify(body)}`)
  }
}
