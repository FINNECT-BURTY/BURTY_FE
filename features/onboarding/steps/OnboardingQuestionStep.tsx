import { CircleCheck } from "lucide-react";

import type { OnboardingStep } from "@/features/onboarding/constants/onboardingSteps";
import { OnboardingProgressBar } from "@/features/onboarding/ui/OnboardingProgressBar";
import { OnboardingHeader } from "@/shared/layout/OnboardingHeader";


type OnboardingQuestionStepProps = Readonly<{
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  selectedValue: string;
  onBack: () => void;
  onNext: () => void;
  onSelect: (value: string) => void;
}>;

const optionButtonClassName =
  "flex h-18 items-center justify-between rounded-xl px-6 text-left text-base font-medium";
const selectedOptionButtonClassName = `${optionButtonClassName} border-2 border-primary bg-sub-background text-primary`;
const unselectedOptionButtonClassName = `${optionButtonClassName} border border-border bg-background text-foreground`;

export function OnboardingQuestionStep({
  step,
  currentStep,
  totalSteps,
  selectedValue,
  onBack,
  onNext,
  onSelect,
}: OnboardingQuestionStepProps) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background text-foreground">
      <OnboardingHeader onBack={onBack} />
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <section className="px-6 pt-12">
        <h1 className="text-2xl font-semibold leading-8 text-primary">
          {step.title}
        </h1>
        <p className="mt-2 text-sm font-medium text-sub-foreground">
          {step.description}
        </p>
      </section>

      <section className="mt-10 flex flex-col gap-3 px-6">
        {step.options.map((option) => {
          const selected = option.value === selectedValue;

          return (
            <button
              aria-pressed={selected}
              className={
                selected
                  ? selectedOptionButtonClassName
                  : unselectedOptionButtonClassName
              }
              key={option.value}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              {option.label}
              {selected ? (
                <CircleCheck
                  aria-hidden="true"
                  className="text-primary"
                  size={20}
                  strokeWidth={2}
                />
              ) : null}
            </button>
          );
        })}
      </section>

      <footer className="mt-auto px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-8">
        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-medium text-background"
          onClick={onNext}
          type="button"
        >
          다음
        </button>
      </footer>
    </main>
  );
}
