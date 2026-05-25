type JwtPayload = Readonly<{
  exp?: unknown;
  sub?: unknown;
}>;

function readJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
}

export function readJwtSubject(token: string): string | null {
  const payload = readJwtPayload(token);
  return typeof payload?.sub === "string" ? payload.sub : null;
}

/** JWT exp(초) 기준 만료 여부. 파싱 실패 시 만료된 것으로 본다. */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = readJwtPayload(token);
  if (typeof payload?.exp !== "number") return true;

  return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}
