"use client";

import { useEffect, useState } from "react";

import { OnboardingAgreementScreen } from "@/features/onboarding/components/OnboardingAgreementScreen";
import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingProfileScreen } from "@/features/onboarding/components/OnboardingProfileScreen";
import type { AgreementState } from "@/features/onboarding/constants/agreements";
import { markSkipStartupSplash } from "@/shared/layout/startupSplash";

const ONBOARDING_PATHNAME = "/onboarding";

type OnboardingScreenView = "entry" | "profile" | "agreement" | "funnel";
type OnboardingStepView = Exclude<OnboardingScreenView, "entry">;

function resolveOnboardingStep(
  searchParams: URLSearchParams,
): OnboardingScreenView | null {
  // 홈(`/`)에서는 로그인 화면만 보여준다. 쿼리로 약관 단계 진입하지 않는다.
  if (typeof window !== "undefined" && window.location.pathname === "/") {
    return null;
  }

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
  // 동의 화면에서 받은 항목별 값을 프로필 저장까지 들고 간다. 예전에는 화면에서만 쓰고
  // 버려서 백엔드에는 termsAccepted 하나만 갔고, 나머지 동의는 기록이 남지 않았다.
  const [agreements, setAgreements] = useState<AgreementState | null>(null);

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
    markSkipStartupSplash();
    // 온보딩의 마지막은 "연결하기" 다. 예전에는 홈으로 보내 아무것도 연결되지 않았다.
    window.location.replace("/mypage/institutions?from=onboarding");
  };

  if (view === "entry") {
    return <OnboardingEntry />;
  }

  if (view === "profile" && agreements) {
    return (
      <OnboardingProfileScreen
        agreements={agreements}
        onBack={() => replaceOnboardingStep("agreement")}
        onComplete={() => replaceOnboardingStep("funnel")}
      />
    );
  }

  // 동의를 거치지 않고 프로필 단계로 바로 들어오면(주소 직접 입력 등) 동의부터 받는다.
  // 받은 적 없는 동의를 만들어 보낼 수는 없다.
  if (view === "agreement" || view === "profile") {
    return (
      <OnboardingAgreementScreen
        onBackToEntry={handleBackToEntry}
        onComplete={(agreed) => {
          setAgreements(agreed);
          replaceOnboardingStep("profile");
        }}
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
