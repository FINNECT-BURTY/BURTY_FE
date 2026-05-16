type OnboardingExitConfirmModalProps = Readonly<{
  title: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}>;

export function OnboardingExitConfirmModal({
  title,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: OnboardingExitConfirmModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-grayscale-1000/60 px-6">
      <section
        aria-modal="true"
        className="w-full max-w-[362px] rounded-3xl bg-background px-5 py-6 text-center"
        role="dialog"
      >
        <h2 className="text-title-sm whitespace-pre-line text-grayscale-1000">
          {title}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {secondaryLabel && onSecondary ? (
            <button
              className="text-title-sm flex h-12 items-center justify-center rounded-2xl bg-grayscale-200 text-grayscale-700"
              onClick={onSecondary}
              type="button"
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            className={`text-title-sm flex h-12 items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000 ${
              secondaryLabel ? "" : "col-span-2"
            }`}
            onClick={onPrimary}
            type="button"
          >
            {primaryLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
