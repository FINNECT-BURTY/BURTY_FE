"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

type AppTopBarProps = Readonly<{
  title?: string;
}>;

export function AppTopBar({ title = "BURTY" }: AppTopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-background px-5">
      <div className="text-title-sm text-grayscale-1000">{title}</div>
      <Link
        aria-label="알림 보기"
        className="flex size-10 items-center justify-center rounded-full text-grayscale-900"
        href="/notifications"
      >
        <Bell aria-hidden="true" fill="currentColor" size={21} strokeWidth={1.8} />
      </Link>
    </header>
  );
}
