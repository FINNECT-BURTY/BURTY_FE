import { cookies } from "next/headers";

import { HomeScreen } from "@/features/home";
import { OnboardingFlow } from "@/features/onboarding";
import { SESSION_MARKER_COOKIE_NAME } from "@/shared/auth/tokenStorage";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

/**
 * `MainRouteGuard` 가 `/auth/me` 응답을 받기 전(=checking) 에 보여줄 fallback 을 결정한다.
 *
 * - 세션 마커 쿠키가 있으면 사용자가 로그인된 상태일 가능성이 높다. 스플래시를 띄우면
 *   "스플래시 → 로그인 화면 → 홈" 으로 깜빡이므로, 빈 배경을 잠깐 보여주고 인증 결과에 따라
 *   `HomeScreen` 으로 자연스럽게 전환한다.
 * - 마커가 없으면 첫 방문/비로그인 사용자이므로 스플래시를 즉시 띄운다.
 */
export default async function Page() {
  const cookieStore = await cookies();
  const hasSessionMarker =
    cookieStore.get(SESSION_MARKER_COOKIE_NAME)?.value === "1";

  const checkingFallback = hasSessionMarker ? (
    <div aria-hidden className="flex min-h-0 flex-1 bg-background" />
  ) : (
    <OnboardingFlow />
  );

  return (
    <MainRouteGuard
      checkingFallback={checkingFallback}
      unauthenticatedFallback={<OnboardingFlow />}
    >
      <HomeScreen />
    </MainRouteGuard>
  );
}
