export type ApiKeyStrategy = 'header' | 'query'

export function apiKeyAuth(
  key: string,
  strategy: ApiKeyStrategy = 'header',
  headerName = 'X-API-Key',
): { headers?: Record<string, string>; query?: Record<string, string> } {
  if (strategy === 'header') {
    return { headers: { [headerName]: key } }
  }
  return { query: { api_key: key } }
}
