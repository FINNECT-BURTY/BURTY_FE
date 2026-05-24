"use client";

import { useEffect, useState } from "react";

import { OnboardingAgreementScreen } from "@/features/onboarding/components/OnboardingAgreementScreen";
import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingProfileScreen } from "@/features/onboarding/components/OnboardingProfileScreen";
import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";

const SPLASH_DURATION_MS = 9200;
const SPLASH_SEEN_STORAGE_KEY = "burty.onboarding.splashSeen";
const ONBOARDING_PATHNAME = "/onboarding";

type OnboardingScreenView = "splash" | "entry" | "profile" | "agreement" | "funnel";
type OnboardingRouteView = Exclude<OnboardingScreenView, "splash">;
type OnboardingStepView = Exclude<OnboardingScreenView, "splash" | "entry">;

function readSplashSeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SPLASH_SEEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SPLASH_SEEN_STORAGE_KEY, "true");
  } catch {
    // Storage 접근 실패는 무시한다. 다음 진입 시 한번 더 스플래시가 보일 뿐이다.
  }
}

function resolveOnboardingStep(searchParams: URLSearchParams): OnboardingRouteView | null {
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
  const [view, setView] = useState<OnboardingScreenView>("splash");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const onboardingStep = resolveOnboardingStep(searchParams);

    // URL 로 진행 단계가 지정된 경우는 스플래시를 건너뛴다.
    if (onboardingStep) {
      const skipTimer = window.setTimeout(() => setView(onboardingStep), 0);
      return () => window.clearTimeout(skipTimer);
    }

    // 한 번이라도 스플래시를 본 적이 있으면 바로 소셜 로그인 화면으로 진입한다.
    if (readSplashSeen()) {
      const skipTimer = window.setTimeout(() => setView("entry"), 0);
      return () => window.clearTimeout(skipTimer);
    }

    const timer = window.setTimeout(() => {
      markSplashSeen();
      setView("entry");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
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

  if (view === "splash") {
    return <OnboardingSplash />;
  }

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
