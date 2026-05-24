import { HomeScreen } from "@/features/home";
import { OnboardingFlow } from "@/features/onboarding";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";

export default function Page() {
  return (
    <MainRouteGuard
      checkingFallback={<OnboardingFlow />}
      unauthenticatedFallback={<OnboardingFlow />}
    >
      <HomeScreen />
    </MainRouteGuard>
  );
}
