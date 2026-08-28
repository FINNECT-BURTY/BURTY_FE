/** 배포 기본값. 환경변수가 없으면 이 값을 쓴다. */
const DEFAULT_API_BASE_URL = "https://burty.co.kr";

/**
 * 브라우저에서 쓰는 베이스 URL.
 *
 * <p>{@code NEXT_PUBLIC_*} 는 빌드 시점에 번들에 박힌다. 로컬 백엔드를 향하게 하려면
 * 빌드 전에 설정해야 한다.
 */
const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

/** Route Handler(서버 사이드)에서 쓰는 베이스 URL. 런타임에 읽힌다. */
const SERVER_API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

/**
 * 브라우저 → BURTY API 직접 호출용 베이스 URL.
 * BFF 소셜 로그인 후 HttpOnly 쿠키는 API 호스트에 저장되므로,
 * 인증이 필요한 요청은 반드시 이 URL 로 credentials: "include" 와 함께 호출한다.
 */
export function getPublicApiBaseUrl(): string {
  return normalizeBaseUrl(PUBLIC_API_BASE_URL);
}

/** Next.js Route Handler → BURTY API (서버 사이드). */
export function getServerApiBaseUrl(): string {
  return normalizeBaseUrl(SERVER_API_BASE_URL);
}

/** OAuth redirect URL 생성 시 백엔드에 전달할 프론트 앱 origin. */
export function getPublicAppBaseUrl(requestOrigin: string): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_BASE_URL ?? requestOrigin);
}
