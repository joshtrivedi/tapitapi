import 'dotenv/config'
import { logRequest, redact } from './logger.js'

export interface ApiResponse<T = unknown> {
  status: number
  body: T
  headers: Record<string, string>
  latencyMs: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestOptions {
  provider: string
  baseUrl: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  headers?: Record<string, string>
  body?: unknown
}

export async function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const { provider, baseUrl, method, path, headers = {}, body } = options
  const url = `${baseUrl}${path}`
  const start = Date.now()

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError(`Network error calling ${method} ${url}`, err)
  }

  const latencyMs = Date.now() - start
  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  let responseBody: T
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    responseBody = (await response.json()) as T
  } else {
    responseBody = (await response.text()) as unknown as T
  }

  logRequest({
    provider,
    method,
    endpoint: path,
    status: response.status,
    latencyMs,
    requestId: responseHeaders['x-request-id'],
    timestamp: new Date().toISOString(),
  })

  // Log redacted headers for debugging (only in non-production)
  if (process.env['NODE_ENV'] !== 'production') {
    const _ = redact(headers)
    void _
  }

  return {
    status: response.status,
    body: responseBody,
    headers: responseHeaders,
    latencyMs,
  }
}
