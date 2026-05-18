import { getPublicApiBaseUrl } from "@/shared/api/config";

type BackendFetchInit = Omit<RequestInit, "credentials">;

/**
 * BURTY API 로 쿠키 인증 요청 (BFF 로그인 후 BURTY_ACCESS / BURTY_REFRESH).
 */
export async function backendFetch(
  path: string,
  init: BackendFetchInit = {},
): Promise<Response> {
  const base = getPublicApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL 이 설정되지 않았습니다. .env.local 을 확인해 주세요.",
    );
  }

  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
}
