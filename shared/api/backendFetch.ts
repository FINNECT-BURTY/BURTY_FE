import { getPublicApiBaseUrl } from "@/shared/api/config";
import { isJwtExpired } from "@/shared/auth/jwtSubject";
import {
  clearAuthTokens,
  clearSessionMarker,
  getAccessToken,
  getRefreshToken,
  hasAuthTokens,
  setAuthTokens,
} from "@/shared/auth/tokenStorage";

type BackendFetchInit = Omit<RequestInit, "credentials">;

type RefreshTokenPair = Readonly<{
  accessToken?: string;
  refreshToken?: string;
}>;

type RefreshResponse = Readonly<{
  success?: boolean;
  data?: RefreshTokenPair | null;
}>;

const AUTH_CREDENTIAL_ENDPOINTS = [
  "/api/v1/auth/email/login",
  "/api/v1/auth/email/register",
] as const;

function isAuthCredentialRequest(url: string) {
  return AUTH_CREDENTIAL_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function buildHeaders(
  init: BackendFetchInit,
  accessToken: string | null,
  includeBearer: boolean,
) {
  const baseHeaders: HeadersInit = {
    Accept: "application/json",
    ...init.headers,
  };

  if (!includeBearer || !accessToken) return baseHeaders;

  return {
    ...baseHeaders,
    Authorization: `Bearer ${accessToken}`,
  };
}

function resolveAccessTokenForRequest(url: string): string | null {
  if (isAuthCredentialRequest(url)) return null;

  const accessToken = getAccessToken();
  if (!accessToken || isJwtExpired(accessToken)) return null;

  return accessToken;
}

async function fetchBackend(
  url: string,
  init: BackendFetchInit,
  accessToken: string | null,
) {
  return fetch(url, {
    ...init,
    credentials: "include",
    headers: buildHeaders(init, accessToken, accessToken !== null),
  });
}

/**
 * Refresh token 으로 새 access/refresh 쌍을 발급받는다.
 * - body 에 refreshToken 을 명시 전송 (SPA 이메일 로그인 경로).
 * - 쿠키 기반 BFF 인증 사용자(소셜 로그인) 도 함께 처리되도록 credentials: include 유지.
 * - 회전된 토큰이 응답 본문에 오면 localStorage 를 갱신한다.
 */
async function refreshSession(base: string): Promise<boolean> {
  const storedRefreshToken = getRefreshToken();

  let response: Response;
  try {
    response = await fetch(`${base}/api/v1/auth/refresh`, {
      body: JSON.stringify(
        storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
      ),
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    return false;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthTokens();
      clearSessionMarker();
    }
    return false;
  }

  const payload = (await response.json().catch(() => null)) as
    | RefreshResponse
    | null;

  if (payload?.success !== true) {
    return false;
  }

  const nextAccessToken = payload.data?.accessToken;
  const nextRefreshToken = payload.data?.refreshToken;

  if (nextAccessToken && nextRefreshToken) {
    setAuthTokens({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });
  }

  return true;
}

/**
 * BFF 소셜 로그인 세션(HttpOnly refresh 쿠키)에서 SPA용 Bearer 토큰을 받아 localStorage에 저장한다.
 *
 * Swagger: POST /auth/refresh 는 body 또는 BURTY_REFRESH 쿠키로 토큰을 재발급하고,
 * GET /users/me/name 은 bearerAuth 로만 문서화되어 있다.
 */
export async function hydrateAuthTokensFromCookieSession(): Promise<boolean> {
  const accessToken = getAccessToken();
  if (accessToken && !isJwtExpired(accessToken) && hasAuthTokens()) {
    return true;
  }

  if (hasAuthTokens()) {
    clearAuthTokens();
  }

  const base = getPublicApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${base}/api/v1/auth/refresh`, {
      body: JSON.stringify({}),
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    return false;
  }

  if (!response.ok) return false;

  const payload = (await response.json().catch(() => null)) as
    | RefreshResponse
    | null;

  if (payload?.success !== true) return false;

  const nextAccessToken = payload.data?.accessToken;
  const nextRefreshToken = payload.data?.refreshToken;

  if (!nextAccessToken || !nextRefreshToken) return false;

  setAuthTokens({
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  });

  return true;
}

/**
 * BURTY API 호출 래퍼.
 *
 * - 모든 요청에 `credentials: "include"` 를 사용해 BFF 소셜 로그인 쿠키 인증을 지원한다.
 * - 클라이언트가 토큰을 보관하고 있으면 (`shared/auth/tokenStorage`) `Authorization: Bearer ...`
 *   헤더를 함께 보낸다. 이메일 SPA 로그인 사용자가 cross-site 쿠키 차단 환경에서도 동작한다.
 * - 401 응답을 받으면 refresh 를 시도하고, 회전된 토큰으로 원 요청을 한 번 더 보낸다.
 *   refresh 자체나 logout 요청은 재시도 대상에서 제외한다 (무한 루프 방지).
 */
export async function backendFetch(
  path: string,
  init: BackendFetchInit = {},
): Promise<Response> {
  const base = getPublicApiBaseUrl();

  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const accessToken = resolveAccessTokenForRequest(url);
  let response = await fetchBackend(url, init, accessToken);

  const shouldRetryWithoutBearer =
    response.status === 401 &&
    accessToken !== null &&
    !isAuthCredentialRequest(url);

  if (shouldRetryWithoutBearer) {
    // BE는 Authorization Bearer를 쿠키보다 우선한다. 만료·타 사용자 토큰이
    // 남아 있으면 유효한 HttpOnly 세션도 401이 난다.
    const cookieOnlyResponse = await fetchBackend(url, init, null);
    if (cookieOnlyResponse.status !== 401) {
      return cookieOnlyResponse;
    }
    response = cookieOnlyResponse;
  }

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

  return fetchBackend(url, init, resolveAccessTokenForRequest(url));
}
