const PUBLIC_API_BASE_URL = "https://burty.co.kr";
const SERVER_API_BASE_URL = "http://44.194.3.230:8080";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

// TODO: 다시 환경변수화 필요

/**
 * 브라우저 → BURTY API 직접 호출용 베이스 URL.
 * BFF 소셜 로그인 후 HttpOnly 쿠키는 API 호스트에 저장되므로,
 * 인증이 필요한 요청은 반드시 이 URL 로 credentials: "include" 와 함께 호출한다.
 */
export function getPublicApiBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? PUBLIC_API_BASE_URL,
  );
}

/** Next.js Route Handler → BURTY API (서버 사이드). */
export function getServerApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.BURTY_API_BASE_URL ?? SERVER_API_BASE_URL);
}

/** OAuth redirect URL 생성 시 백엔드에 전달할 프론트 앱 origin. */
export function getPublicAppBaseUrl(requestOrigin: string): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_BASE_URL ?? requestOrigin);
}
