import { getPublicApiBaseUrl } from "@/shared/api/config";

type BackendFetchInit = Omit<RequestInit, "credentials">;

async function refreshSession(base: string): Promise<boolean> {
  const response = await fetch(`${base}/api/v1/auth/refresh`, {
    body: "{}",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) return false;

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean }
    | null;
  return payload?.success === true;
}

/**
 * BURTY API 로 쿠키 인증 요청 (BFF 로그인 후 BURTY_ACCESS / BURTY_REFRESH).
 */
export async function backendFetch(
  path: string,
  init: BackendFetchInit = {},
): Promise<Response> {
  const base = getPublicApiBaseUrl();

  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  const shouldRetryWithRefresh =
    response.status === 401 &&
    !url.includes("/api/v1/auth/refresh") &&
    !url.includes("/api/v1/auth/logout");

  if (!shouldRetryWithRefresh) {
    return response;
  }

  const refreshed = await refreshSession(base);
  if (!refreshed) {
    return response;
  }

  return fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
}
