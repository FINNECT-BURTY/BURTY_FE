/**
 * 브라우저 → BURTY API 직접 호출용 베이스 URL.
 * BFF 소셜 로그인 후 HttpOnly 쿠키는 API 호스트에 저장되므로,
 * 인증이 필요한 요청은 반드시 이 URL 로 credentials: "include" 와 함께 호출한다.
 */
export function getPublicApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
  return base.replace(/\/$/, "");
}

/** Next.js Route Handler → BURTY API (서버 사이드). */
export function getServerApiBaseUrl(): string {
  const base =
    process.env.BURTY_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://44.194.3.230:8080";
  return base.replace(/\/$/, "");
}
