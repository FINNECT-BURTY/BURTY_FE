export const SKIP_STARTUP_SPLASH_KEY = "burty.skipStartupSplash";

let documentEntryPathname: string | null = null;
let splashConsumedThisDocument = false;

function getDocumentEntryPathname(): string {
  if (typeof window === "undefined") return "";
  if (documentEntryPathname === null) {
    documentEntryPathname = window.location.pathname;
  }
  return documentEntryPathname;
}

export function markSkipStartupSplash() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SKIP_STARTUP_SPLASH_KEY, "1");
  } catch {
    // storage 접근 실패는 무시한다.
  }
}

function consumeSkipStartupSplashFlag(): boolean {
  try {
    const shouldSkip = sessionStorage.getItem(SKIP_STARTUP_SPLASH_KEY) === "1";
    if (shouldSkip) {
      sessionStorage.removeItem(SKIP_STARTUP_SPLASH_KEY);
    }
    return shouldSkip;
  } catch {
    return false;
  }
}

/**
 * `/` 로 처음 접속하거나 새로고침했을 때만 true.
 * - 문서 진입 경로가 `/` 가 아니면 false (예: /auth/callback → router.replace("/"))
 * - 같은 문서 안에서 홈 탭 재진입 등은 false
 * - 로그인/온보딩 완료 후 홈 이동은 markSkipStartupSplash() 로 false
 */
export function shouldShowStartupSplash(): boolean {
  if (typeof window === "undefined") return false;

  if (consumeSkipStartupSplashFlag()) {
    return false;
  }

  if (getDocumentEntryPathname() !== "/") {
    return false;
  }

  if (splashConsumedThisDocument) {
    return false;
  }

  splashConsumedThisDocument = true;
  return true;
}
