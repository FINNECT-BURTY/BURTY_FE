"use client";

import { useEffect, useState } from "react";

import { OnboardingAgreementScreen } from "@/features/onboarding/components/OnboardingAgreementScreen";
import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";

const SPLASH_DURATION_MS = 3000;

type OnboardingScreenView = "splash" | "entry" | "agreement" | "funnel";

export function OnboardingFlow() {
  const [view, setView] = useState<OnboardingScreenView>("splash");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView("entry");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  if (view === "splash") {
    return <OnboardingSplash />;
  }

  if (view === "entry") {
    return <OnboardingEntry onStart={() => setView("agreement")} />;
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
