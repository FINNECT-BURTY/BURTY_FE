"use client";

import { useEffect, useState } from "react";

import { OnboardingAgreementScreen } from "@/features/onboarding/components/OnboardingAgreementScreen";
import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingProfileScreen } from "@/features/onboarding/components/OnboardingProfileScreen";
import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";

const SPLASH_DURATION_MS = 3000;
const SPLASH_SEEN_KEY = "burty:onboarding-splash-seen";

type OnboardingScreenView = "splash" | "entry" | "profile" | "agreement" | "funnel";

function shouldShowProfileOnboarding(searchParams: URLSearchParams) {
  return (
    searchParams.get("step") === "profile" ||
    searchParams.get("newUser") === "true" ||
    searchParams.get("profileComplete") === "false"
  );
}

function hasSeenSplash() {
  try {
    return window.sessionStorage.getItem(SPLASH_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    window.sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
  } catch {
    // 스토리지가 막힌 환경에서도 스플래시 전환은 계속 진행한다.
  }
}

export function OnboardingFlow() {
  const [view, setView] = useState<OnboardingScreenView>("splash");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (shouldShowProfileOnboarding(searchParams)) {
      setView("profile");
      return;
    }

    if (hasSeenSplash()) {
      setView("entry");
      return;
    }

    markSplashSeen();

    const timer = window.setTimeout(() => {
      setView("entry");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  if (view === "splash") {
    return <OnboardingSplash />;
  }

  if (view === "entry") {
    return <OnboardingEntry />;
  }

  if (view === "profile") {
    return <OnboardingProfileScreen />;
  }

  if (view === "agreement") {
    return (
      <OnboardingAgreementScreen
        onBackToEntry={() => setView("entry")}
        onComplete={() => setView("funnel")}
      />
    );
  }

  return <OnboardingFunnel onBackToAgreement={() => setView("agreement")} />;
}
