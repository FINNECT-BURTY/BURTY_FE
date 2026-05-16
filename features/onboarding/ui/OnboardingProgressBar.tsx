type OnboardingProgressBarProps = Readonly<{
  currentStep: number;
  totalSteps: number;
}>;

function getProgress(currentStep: number, totalSteps: number) {
  const safeTotalSteps = Math.max(totalSteps, 0);

  if (safeTotalSteps === 0) {
    return { current: 0, total: 0, width: "0%" };
  }

  const current = Math.min(Math.max(currentStep, 0), safeTotalSteps);
  const width = `${(current / safeTotalSteps) * 100}%`;

  return { current, total: safeTotalSteps, width };
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) {
  const progress = getProgress(currentStep, totalSteps);

  return (
    <section className="px-6">
      <div
        aria-label="온보딩 진행률"
        aria-valuemax={progress.total}
        aria-valuemin={0}
        aria-valuenow={progress.current}
        className="h-1.5 rounded-lg bg-grayscale-100"
        role="progressbar"
      >
        <div
          className="h-1.5 rounded-lg bg-yellow-400"
          style={{ width: progress.width }}
        />
      </div>
    </section>
  );
}
