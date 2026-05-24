"use client";

import { useEffect, useState } from "react";

import { OnboardingAgreementScreen } from "@/features/onboarding/components/OnboardingAgreementScreen";
import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingProfileScreen } from "@/features/onboarding/components/OnboardingProfileScreen";

const ONBOARDING_PATHNAME = "/onboarding";

type OnboardingScreenView = "entry" | "profile" | "agreement" | "funnel";
type OnboardingStepView = Exclude<OnboardingScreenView, "entry">;

function resolveOnboardingStep(searchParams: URLSearchParams): OnboardingScreenView | null {
  const step = searchParams.get("step");
  if (step === "entry") {
    return "entry";
  }

  if (step === "agreement" || step === "profile" || step === "funnel") {
    return step;
  }

  if (searchParams.get("newUser") === "true") {
    return "agreement";
  }

  return null;
}

function isOnboardingPathname() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith(ONBOARDING_PATHNAME);
}

export function OnboardingFlow() {
  const [view, setView] = useState<OnboardingScreenView>("entry");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const onboardingStep = resolveOnboardingStep(searchParams);

    if (!onboardingStep || onboardingStep === "entry") {
      return;
    }

    const skipTimer = window.setTimeout(() => setView(onboardingStep), 0);
    return () => window.clearTimeout(skipTimer);
  }, []);

  const replaceUrlForStep = (path: string) => {
    if (!isOnboardingPathname()) return;
    window.history.replaceState(null, "", path);
  };

  const replaceOnboardingStep = (nextView: OnboardingStepView) => {
    replaceUrlForStep(`/onboarding?step=${nextView}`);
    setView(nextView);
  };

  const handleBackToEntry = () => {
    replaceUrlForStep("/onboarding");
    setView("entry");
  };

  const handleOnboardingComplete = () => {
    // 자산 연결까지 끝났으면 홈으로 보낸다. 홈에서 MainRouteGuard 가 다시 인증/프로필 상태를 검증한다.
    window.location.replace("/");
  };

  if (view === "entry") {
    return <OnboardingEntry />;
  }

  if (view === "profile") {
    return (
      <OnboardingProfileScreen
        onBack={() => replaceOnboardingStep("agreement")}
        onComplete={() => replaceOnboardingStep("funnel")}
      />
    );
  }

  if (view === "agreement") {
    return (
      <OnboardingAgreementScreen
        onBackToEntry={handleBackToEntry}
        onComplete={() => replaceOnboardingStep("profile")}
      />
    );
  }

  return (
    <OnboardingFunnel
      onBackToProfile={() => replaceOnboardingStep("profile")}
      onComplete={handleOnboardingComplete}
    />
  );
}
