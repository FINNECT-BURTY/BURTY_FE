import { HomeScreen } from "@/features/home";
import { OnboardingFlow } from "@/features/onboarding";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";
import { StartupSplashGate } from "@/shared/layout/StartupSplashGate";

/**
 * `MainRouteGuard` 가 `/auth/me` 응답을 받기 전(=checking) 에 보여줄 fallback 을 결정한다.
 *
 * 스플래시는 `StartupSplashGate` 가 `/` 첫 접속·새로고침 시에만 보여준다.
 * checking 중에는 빈 배경만 두고, 스플래시가 끝난 뒤 인증 결과에 따라 홈 또는 로그인으로 전환한다.
 */
export default function Page() {
  const checkingFallback = (
    <div aria-hidden className="flex min-h-0 flex-1 bg-background" />
  );

  return (
    <StartupSplashGate>
      <MainRouteGuard
        checkingFallback={checkingFallback}
        unauthenticatedFallback={<OnboardingFlow />}
      >
        <HomeScreen />
      </MainRouteGuard>
    </StartupSplashGate>
  );
}
