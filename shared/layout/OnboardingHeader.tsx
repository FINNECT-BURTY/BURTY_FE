import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type HeaderProps = Readonly<{
  title?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
}>;

export function OnboardingHeader({ title = "Berty", onBack, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center border-b border-sub-background bg-background px-6">
      <div className="flex w-9 shrink-0 justify-start">
        {onBack ? (
          <button
            aria-label="뒤로가기"
            className="-ml-3 flex size-9 items-center justify-center text-primary"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={22} strokeWidth={2} />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 truncate text-center text-base font-semibold text-primary">
        {title}
      </div>
      <div className="flex w-9 shrink-0 justify-end">{rightSlot}</div>
    </header>
  );
}
