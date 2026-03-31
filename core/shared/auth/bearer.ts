export function bearerAuth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}
