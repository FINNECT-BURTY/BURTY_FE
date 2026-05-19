"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type BottomActionButtonTextStyle = "title-sm" | "title-md";

type BottomActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  Readonly<{
    children: ReactNode;
    textStyle?: BottomActionButtonTextStyle;
  }>;

const textStyleClassNames: Record<BottomActionButtonTextStyle, string> = {
  "title-md": "text-title-md",
  "title-sm": "text-title-sm",
};

export function BottomActionButton({
  children,
  className = "",
  disabled = false,
  textStyle = "title-md",
  type = "button",
  ...props
}: BottomActionButtonProps) {
  const stateClassName = disabled
    ? "bg-grayscale-200 text-grayscale-100"
    : "bg-yellow-400 text-grayscale-1000";

  return (
    <button
      {...props}
      className={`${textStyleClassNames[textStyle]} flex h-13 w-full items-center justify-center rounded-2xl ${stateClassName} ${className}`}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
