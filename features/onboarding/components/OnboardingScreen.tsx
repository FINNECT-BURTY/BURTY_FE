"use client";

import { useEffect, useState } from "react";

import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";

const SPLASH_DURATION_MS = 3000;

export function OnboardingScreen() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return showSplash ? <OnboardingSplash /> : <OnboardingEntry />;
}
