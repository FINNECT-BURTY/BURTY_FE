import Image from "next/image";
import type { ReactNode } from "react";

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
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center bg-background px-6">
      <div className="flex w-9 shrink-0 justify-start">
        {onBack ? (
          <button
            aria-label="뒤로가기"
            className="-ml-3 flex size-9 items-center justify-center text-grayscale-1000"
            onClick={onBack}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              height={24}
              src="/icons/header/back-arrow.svg"
              width={24}
            />
          </button>
        ) : null}
      </div>
      <div className="text-title-md min-w-0 flex-1 truncate text-center text-grayscale-1000">
        {title}
      </div>
      <div className="flex w-9 shrink-0 justify-end">{rightSlot}</div>
    </header>
  );
}
