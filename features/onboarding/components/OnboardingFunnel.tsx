"use client";

import { useState } from "react";

import { OnboardingConnectionScreen } from "@/features/onboarding/components/OnboardingConnectionScreen";
import { ONBOARDING_STEPS } from "@/features/onboarding/constants/onboardingSteps";
import { OnboardingQuestionStep } from "@/features/onboarding/steps/OnboardingQuestionStep";

type OnboardingFunnelProps = Readonly<{
  onBackToEntry: () => void;
}>;

type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];
type OnboardingAnswers = Record<OnboardingStepId, string>;
type OnboardingView =
  | Readonly<{ type: "questions"; stepIndex: number }>
  | Readonly<{ type: "connection" }>;

function createInitialAnswers(): OnboardingAnswers {
  return Object.fromEntries(
    ONBOARDING_STEPS.map((step) => [step.id, step.options[0].value]),
  ) as OnboardingAnswers;
}

function getStepIndex(stepIndex: number, totalSteps: number) {
  return Math.min(Math.max(stepIndex, 0), totalSteps - 1);
}

export function OnboardingFunnel({ onBackToEntry }: OnboardingFunnelProps) {
  const [view, setView] = useState<OnboardingView>({
    type: "questions",
    stepIndex: 0,
  });
  const [answers, setAnswers] =
    useState<OnboardingAnswers>(createInitialAnswers);
  const totalSteps = Number(ONBOARDING_STEPS.length);

  if (view.type === "connection") {
    return <OnboardingConnectionScreen />;
  }

  const currentStepIndex = getStepIndex(view.stepIndex, totalSteps);
  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const selectedValue = answers[currentStep.id] ?? currentStep.options[0].value;

  const handleBack = () => {
    if (view.stepIndex === 0) {
      onBackToEntry();
      return;
    }

    setView((currentView) => {
      if (currentView.type !== "questions") {
        return currentView;
      }

      return { type: "questions", stepIndex: currentView.stepIndex - 1 };
    });
  };

  const handleNext = () => {
    setView((currentView) => {
      if (currentView.type !== "questions") {
        return currentView;
      }

      const nextStepIndex = currentView.stepIndex + 1;

      if (nextStepIndex >= totalSteps) {
        return { type: "connection" };
      }

      return { type: "questions", stepIndex: nextStepIndex };
    });
  };

  const handleSelect = (value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentStep.id]: value,
    }));
  };

  return (
    <OnboardingQuestionStep
      currentStep={currentStepIndex + 1}
      onBack={handleBack}
      onNext={handleNext}
      onSelect={handleSelect}
      selectedValue={selectedValue}
      step={currentStep}
      totalSteps={totalSteps}
    />
  );
}
