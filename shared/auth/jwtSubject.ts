export function readJwtSubject(token: string): string | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized)) as { sub?: unknown };

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
