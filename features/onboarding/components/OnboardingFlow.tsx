"use client";

import { useEffect, useState } from "react";

import { OnboardingAgreementScreen } from "@/features/onboarding/components/OnboardingAgreementScreen";
import { OnboardingEntry } from "@/features/onboarding/components/OnboardingEntry";
import { OnboardingFunnel } from "@/features/onboarding/components/OnboardingFunnel";
import { OnboardingProfileScreen } from "@/features/onboarding/components/OnboardingProfileScreen";
import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";

const SPLASH_DURATION_MS = 9200;

type OnboardingScreenView = "splash" | "entry" | "profile" | "agreement" | "funnel";
type OnboardingRouteView = Exclude<OnboardingScreenView, "splash">;
type OnboardingStepView = Exclude<OnboardingScreenView, "splash" | "entry">;

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

export function OnboardingFlow() {
  const [view, setView] = useState<OnboardingScreenView>("splash");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const onboardingStep = resolveOnboardingStep(searchParams);

    if (onboardingStep) {
      const timer = window.setTimeout(() => {
        setView(onboardingStep);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setView("entry");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const replaceOnboardingStep = (nextView: OnboardingStepView) => {
    window.history.replaceState(null, "", `/onboarding?step=${nextView}`);
    setView(nextView);
  };

  const handleBackToEntry = () => {
    window.history.replaceState(null, "", "/onboarding");
    setView("entry");
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
    />
  );
}
