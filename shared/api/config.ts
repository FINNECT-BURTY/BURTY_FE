function normalizeBaseUrl(value: string | undefined, envName: string): string {
  if (!value) {
    throw new Error(`${envName} 환경변수가 설정되지 않았습니다.`);
  }

  return value.replace(/\/$/, "");
}

/**
 * 브라우저 → BURTY API 직접 호출용 베이스 URL.
 * BFF 소셜 로그인 후 HttpOnly 쿠키는 API 호스트에 저장되므로,
 * 인증이 필요한 요청은 반드시 이 URL 로 credentials: "include" 와 함께 호출한다.
 */
export function getPublicApiBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "NEXT_PUBLIC_API_BASE_URL",
  );
}

/** Next.js Route Handler → BURTY API (서버 사이드). */
export function getServerApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.BURTY_API_BASE_URL, "BURTY_API_BASE_URL");
}
