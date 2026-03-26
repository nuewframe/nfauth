/** Decode JWT payload (middle section) into an object. */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded) as Record<string, unknown>;
}

/** Decode JWT header (first section) into an object. */
export function decodeJwtHeader(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token format');
  }

  const header = parts[0];
  const decoded = atob(header.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded) as Record<string, unknown>;
}
