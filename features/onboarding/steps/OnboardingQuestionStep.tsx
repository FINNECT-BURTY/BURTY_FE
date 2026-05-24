import type { OnboardingStep } from "@/features/onboarding/constants/onboardingSteps";
import { OnboardingProgressBar } from "@/features/onboarding/ui/OnboardingProgressBar";
import { OnboardingHeader } from "@/shared/layout/OnboardingHeader";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";

type OnboardingQuestionStepProps = Readonly<{
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  selectedValue: string;
  onBack: () => void;
  onNext: () => void;
  onSelect: (value: string) => void;
}>;

function getGridClassName(optionCount: number) {
  if (optionCount > 2) {
    return "grid grid-cols-2 gap-3";
  }

  return "grid grid-cols-2 gap-4";
}

function getOptionClassName(selected: boolean) {
  const baseClassName =
    "text-title-md flex h-42 items-center justify-center rounded-3xl text-center transition-shadow";
  const stateClassName = selected
    ? "bg-yellow-300 text-grayscale-1000 shadow-[0_0_8px_rgba(255,237,158,0.8)]"
    : "bg-background text-grayscale-900 border border-grayscale-100";

  return `${baseClassName} ${stateClassName}`;
}

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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <OnboardingHeader
        onBack={onBack}
        rightSlot={
          <span className="text-body-md text-grayscale-900">
            {currentStep}/{totalSteps}
          </span>
        }
        title="시작하기"
      />
      <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <section className="px-6 pt-7">
        <h1 className="text-title-lg text-grayscale-1000">{step.title}</h1>
        <p className="text-body-md mt-1 text-grayscale-900">
          {step.description}
        </p>
      </section>

      <section className={`mt-6 px-5 ${getGridClassName(step.options.length)}`}>
        {step.options.map((option) => {
          const selected = option.value === selectedValue;

          return (
            <button
              aria-pressed={selected}
              className={getOptionClassName(selected)}
              key={option.value}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </section>

      <BottomActionBar
        actionLabel={currentStep === totalSteps ? "확인" : "다음"}
        actionTextStyle="title-sm"
        className="mt-auto"
        onAction={onNext}
      />
    </main>
  );
}
