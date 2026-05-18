import { backendFetch } from "@/shared/api/backendFetch";

type ApiResponse<T> = Readonly<{
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string | null;
}>;

type TokenPairPayload = Readonly<{
  accessToken?: string;
  refreshToken?: string;
  accessExpiresInSeconds?: number;
  refreshExpiresInSeconds?: number;
}>;

export type CurrentUserPayload = Readonly<{
  userId: string;
  profileComplete: boolean;
}>;

type LogoutPayload = Readonly<{
  logout?: boolean;
}>;

export async function getCurrentAuthUser(): Promise<CurrentUserPayload | null> {
  const response = await backendFetch("/api/v1/auth/me");

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<CurrentUserPayload>
    | null;

  if (payload?.success !== true || !payload.data?.userId) {
    return null;
  }

  return payload.data;
}

/**
 * HttpOnly BURTY_REFRESH 쿠키로 access/refresh 재발급.
 * 세션 갱신이 필요할 때만 호출한다. 로그인 상태 확인은 getCurrentAuthUser 를 사용한다.
 */
export async function refreshAuthSession(): Promise<boolean> {
  const response = await backendFetch("/api/v1/auth/refresh", {
    body: "{}",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<TokenPairPayload>
    | null;
  return payload?.success === true;
}

export async function logoutAuthSession(): Promise<boolean> {
  const response = await backendFetch("/api/v1/auth/logout", {
    body: "{}",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<LogoutPayload>
    | null;
  return payload?.success === true && payload.data?.logout === true;
}
