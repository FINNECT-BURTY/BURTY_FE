import { ConfirmModal } from "@/shared/ui/ConfirmModal";

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
    <ConfirmModal
      onPrimary={onPrimary}
      onSecondary={onSecondary}
      primaryLabel={primaryLabel}
      secondaryLabel={secondaryLabel}
      title={title}
    />
  );
}
