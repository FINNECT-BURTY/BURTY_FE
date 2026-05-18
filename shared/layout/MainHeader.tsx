import { Bell } from "lucide-react";
import Link from "next/link";

export function MainHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-background px-5">
      <div className="text-title-sm min-w-0 flex-1 text-grayscale-1000">
        BURTY
      </div>
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
