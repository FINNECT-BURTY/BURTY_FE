/** 모의 동의 화면이 돌려보낼 수 있는 유일한 경로. 백엔드의 마이데이터 인가 콜백이다. */
export const MYDATA_CALLBACK_PATH = "/api/v1/mydata/oauth/callback";

/**
 * 돌려보내도 되는 주소인지.
 *
 * <p>이 화면은 쿼리로 받은 주소로 브라우저를 보낸다. 검증하지 않으면 누구나 링크 하나로
 * 사용자를 임의의 사이트로 보낼 수 있다(오픈 리다이렉트). 허용한 출처의 콜백 경로 하나만
 * 받는다.
 */
export function isAllowedRedirect(
  redirectUri: string | null,
  allowedOrigins: readonly string[],
  options: Readonly<{ allowLoopback?: boolean }> = {},
): boolean {
  if (!redirectUri) return false;

  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  // user:pass@host 형태는 출처를 속이는 데 쓰인다.
  if (url.username || url.password) return false;
  if (url.pathname !== MYDATA_CALLBACK_PATH) return false;
  if (allowedOrigins.includes(url.origin)) return true;

  // 로컬 개발에서는 FE 와 백엔드가 다른 포트에 뜨고, 프록시 모드에서는 API 기준 주소가 FE 자신이
  // 된다. 그러면 백엔드 콜백의 출처가 목록에 없어 막힌다. 앱이 loopback 에서 돌 때만 loopback
  // 콜백을 허용한다 — 운영 도메인에서는 이 규칙이 켜지지 않는다.
  return Boolean(options.allowLoopback) && isLoopback(url.hostname);
}

export function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export type ConsentDecision = "agree" | "deny";

/**
 * 정보제공자처럼 인가 결과를 붙여 돌려보낸다. 동의하면 code, 거절하면 error 다.
 *
 * <p>state 는 받은 그대로 돌려준다. 백엔드가 그것으로 누구의 어느 기관 요청인지 찾는다.
 */
export function buildConsentRedirect(
  redirectUri: string,
  state: string,
  decision: ConsentDecision,
  code: string,
): string {
  const url = new URL(redirectUri);
  if (decision === "agree") {
    url.searchParams.set("code", code);
  } else {
    url.searchParams.set("error", "access_denied");
  }
  url.searchParams.set("state", state);
  return url.toString();
}

export function mockAuthorizationCode(): string {
  return `mock-${crypto.randomUUID()}`;
}

const scopeLabels: Readonly<Record<string, string>> = {
  "asset.read": "계좌 목록과 잔액",
  "transfer.read": "거래내역",
};

/**
 * 요청 범위를 사람이 읽는 말로.
 *
 * <p>모르는 범위도 숨기지 않고 그대로 적는다. 동의 화면에서 무엇에 동의하는지 빠지면 동의가
 * 아니다.
 */
export function describeScope(scope: string | null): readonly string[] {
  if (!scope) return [];
  return scope
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => scopeLabels[item] ?? item);
}
