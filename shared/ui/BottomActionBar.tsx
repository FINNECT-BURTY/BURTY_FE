"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { BottomActionButton } from "@/shared/ui/BottomActionButton";

type BottomActionBarTextStyle = "title-sm" | "title-md";
type BottomActionBarSecondaryPosition = "above" | "below";
type BottomActionBarTopSpacing = "default" | "large" | "none";
type BottomActionBarBottomSpacing = "default" | "compact";

type BottomActionBarProps = Readonly<{
  actionLabel: ReactNode;
  actionTextStyle?: BottomActionBarTextStyle;
  bottomSpacing?: BottomActionBarBottomSpacing;
  className?: string;
  disabled?: boolean;
  onAction?: () => void;
  onSecondary?: () => void;
  secondaryClassName?: string;
  secondaryHref?: string;
  secondaryLabel?: ReactNode;
  secondaryPosition?: BottomActionBarSecondaryPosition;
  topSpacing?: BottomActionBarTopSpacing;
}>;

const topSpacingClassNames: Record<BottomActionBarTopSpacing, string> = {
  default: "pt-4",
  large: "pt-8",
  none: "pt-0",
};

const bottomSpacingClassNames: Record<BottomActionBarBottomSpacing, string> = {
  compact: "pb-[max(24px,env(safe-area-inset-bottom))]",
  default: "pb-[max(30px,env(safe-area-inset-bottom))]",
};

const secondaryBaseClassNames: Record<BottomActionBarSecondaryPosition, string> =
  {
    above:
      "text-caption mx-auto block border-b border-grayscale-800 pb-0.5 text-grayscale-800",
    below: "text-body-md mx-auto block text-grayscale-1000",
  };

const secondarySpacingClassNames: Record<BottomActionBarSecondaryPosition, string> =
  {
    above: "mb-5",
    below: "mt-7",
  };

export function BottomActionBar({
  actionLabel,
  actionTextStyle = "title-md",
  bottomSpacing = "default",
  className = "",
  disabled = false,
  onAction,
  onSecondary,
  secondaryClassName,
  secondaryHref,
  secondaryLabel,
  secondaryPosition = "below",
  topSpacing = "default",
}: BottomActionBarProps) {
  const secondaryAction = secondaryLabel ? (
    <SecondaryAction
      className={`${secondarySpacingClassNames[secondaryPosition]} ${
        secondaryClassName ?? secondaryBaseClassNames[secondaryPosition]
      }`}
      href={secondaryHref}
      onClick={onSecondary}
    >
      {secondaryLabel}
    </SecondaryAction>
  ) : null;

  return (
    <footer
      className={`px-6 ${topSpacingClassNames[topSpacing]} ${bottomSpacingClassNames[bottomSpacing]} ${className}`}
    >
      {secondaryPosition === "above" ? secondaryAction : null}
      <BottomActionButton
        disabled={disabled}
        onClick={onAction}
        textStyle={actionTextStyle}
      >
        {actionLabel}
      </BottomActionButton>
      {secondaryPosition === "below" ? secondaryAction : null}
    </footer>
  );
}

function SecondaryAction({
  children,
  className,
  href,
  onClick,
}: Readonly<{
  children: ReactNode;
  className: string;
  href?: string;
  onClick?: () => void;
}>) {
  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  );
}
