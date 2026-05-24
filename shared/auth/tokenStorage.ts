/**
 * 이메일 SPA 로그인용 토큰 저장소.
 *
 * BURTY API 는 이메일 로그인 응답을 본문(`accessToken`, `refreshToken`)으로만 내려준다.
 * 쿠키를 통한 BFF 인증(소셜 로그인) 과 병행하기 위해 클라이언트에 토큰을 보관하고
 * 이후 요청에서 `Authorization: Bearer ...` 헤더로 첨부한다.
 *
 * 보안 트레이드오프:
 * - `localStorage` 는 XSS 에 취약하지만 새로고침/탭 복귀에 토큰이 유지되어 UX 가 좋다.
 * - 백엔드가 HttpOnly 쿠키도 함께 내려주게 되면 이 저장소는 제거하고 쿠키 기반으로 일원화한다.
 */

const ACCESS_TOKEN_KEY = "burty.auth.accessToken";
const REFRESH_TOKEN_KEY = "burty.auth.refreshToken";

/**
 * 서버 사이드(`app/page.tsx`) 에서 `cookies()` 로 읽기 위한 비 HttpOnly 세션 마커.
 * 값/내용은 의미가 없고 "이 사용자는 로그인된 상태일 가능성이 높다" 라는 신호만 전달한다.
 * 실제 인증은 항상 `/auth/me` 응답으로 검증한다.
 */
export const SESSION_MARKER_COOKIE_NAME = "burty.has_session";
const SESSION_MARKER_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AuthTokens = Readonly<{
  accessToken: string;
  refreshToken: string;
}>;

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return safeLocalStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return safeLocalStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setAuthTokens(tokens: AuthTokens) {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // Storage quota 초과 등은 무시한다. 다음 로그인 때 다시 시도된다.
  }
}

export function clearAuthTokens() {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // noop
  }
}

export function hasAuthTokens(): boolean {
  return getAccessToken() !== null && getRefreshToken() !== null;
}

export function setSessionMarker() {
  if (typeof document === "undefined") return;

  try {
    document.cookie = `${SESSION_MARKER_COOKIE_NAME}=1; path=/; max-age=${SESSION_MARKER_MAX_AGE_SECONDS}; samesite=lax`;
  } catch {
    // noop
  }
}

export function clearSessionMarker() {
  if (typeof document === "undefined") return;

  try {
    document.cookie = `${SESSION_MARKER_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  } catch {
    // noop
  }
}
