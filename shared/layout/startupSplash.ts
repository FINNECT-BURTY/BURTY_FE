export const SKIP_STARTUP_SPLASH_KEY = "burty.skipStartupSplash";

let documentEntryPathname: string | null = null;
let splashFinishedThisDocument = false;

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

export function markStartupSplashFinished() {
  splashFinishedThisDocument = true;
}

/**
 * `/` 로 처음 접속하거나 새로고침했을 때만 true.
 * React Strict Mode 에서 useState 초기화가 두 번 호출되어도
 * 부수 효과 없이 같은 결과를 반환해야 한다.
 */
export function shouldShowStartupSplash(): boolean {
  if (typeof window === "undefined") return false;

  if (splashFinishedThisDocument) {
    return false;
  }

  if (consumeSkipStartupSplashFlag()) {
    return false;
  }

  if (getDocumentEntryPathname() !== "/") {
    return false;
  }

  return true;
}
