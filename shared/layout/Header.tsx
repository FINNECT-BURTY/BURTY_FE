import Image from "next/image";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type HeaderProps = Readonly<{
  className?: string;
  leftClassName?: string;
  leftSlot?: ReactNode;
  rightClassName?: string;
  rightSlot?: ReactNode;
  sticky?: boolean;
  title?: ReactNode;
  titleClassName?: string;
}>;

type HeaderIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  Readonly<{
    iconSrc: string;
  }>;

export function Header({
  className = "",
  leftClassName = "flex w-10 shrink-0 items-center justify-start",
  leftSlot,
  rightClassName = "flex w-10 shrink-0 items-center justify-end",
  rightSlot,
  sticky = false,
  title,
  titleClassName = "text-title-md min-w-0 flex-1 truncate text-center text-grayscale-1000",
}: HeaderProps) {
  return (
    <header
      className={`flex min-h-16 shrink-0 items-center bg-main-background px-6 pt-[env(safe-area-inset-top)] ${
        sticky ? "sticky top-0 z-10" : ""
      } ${className}`}
    >
      <div className={leftClassName}>{leftSlot}</div>
      {title !== undefined ? <div className={titleClassName}>{title}</div> : null}
      <div className={rightClassName}>{rightSlot}</div>
    </header>
  );
}

export function HeaderIconButton({
  className = "",
  iconSrc,
  type = "button",
  ...props
}: HeaderIconButtonProps) {
  return (
    <button
      {...props}
      className={`flex size-10 items-center justify-center text-grayscale-1000 ${className}`}
      type={type}
    >
      <Image
        alt=""
        aria-hidden="true"
        height={24}
        src={iconSrc}
        width={24}
      />
    </button>
  );
}

export function HeaderBackButton({
  onClick,
}: Readonly<{
  onClick: () => void;
}>) {
  return (
    <HeaderIconButton
      aria-label="뒤로가기"
      iconSrc="/icons/header/back-arrow.svg"
      onClick={onClick}
    />
  );
}
