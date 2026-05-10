"use client";

import { useEffect, useState } from "react";

import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";

const SPLASH_DURATION_MS = 3000;

type OnboardingScreenView = "splash" | "entry" | "funnel";

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
    return <OnboardingEntry onStart={() => setView("funnel")} />;
  }

  return <OnboardingFunnel onBackToEntry={() => setView("entry")} />;
}
