import type { ReactNode } from "react";

import { Header, HeaderBackButton } from "@/shared/layout/Header";

type HeaderProps = Readonly<{
  title?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
}>;

export function OnboardingHeader({
  title = "Berty",
  onBack,
  rightSlot,
}: HeaderProps) {
  return (
    <Header
      className="!bg-background"
      leftSlot={onBack ? <HeaderBackButton onClick={onBack} /> : null}
      rightSlot={rightSlot}
      sticky
      title={title}
    />
  );
}
