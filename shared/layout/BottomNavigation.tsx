"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const bottomNavigationItems = [
  {
    label: "홈",
    href: "/",
    activeIconSrc: "/icons/bottom-nav/home-active.svg",
    defaultIconSrc: "/icons/bottom-nav/home-default.svg",
  },
  {
    label: "자산",
    href: "/finance",
    activeIconSrc: "/icons/bottom-nav/finance-active.svg",
    defaultIconSrc: "/icons/bottom-nav/finance-default.svg",
  },
  {
    label: "솔루션",
    href: "/solution",
    activeIconSrc: "/icons/bottom-nav/solution-active.svg",
    defaultIconSrc: "/icons/bottom-nav/solution-default.svg",
  },
  {
    label: "지원금",
    href: "/grant",
    activeIconSrc: "/icons/bottom-nav/grant-active.svg",
    defaultIconSrc: "/icons/bottom-nav/grant-default.svg",
  },
  {
    label: "마이페이지",
    href: "/mypage",
    activeIconSrc: "/icons/bottom-nav/mypage-active.svg",
    defaultIconSrc: "/icons/bottom-nav/mypage-default.svg",
  },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 내비게이션"
      className="grid min-h-18 shrink-0 grid-cols-5 rounded-t-2xl bg-background px-2 pt-2 pb-[env(safe-area-inset-bottom)] shadow-1"
    >
      {bottomNavigationItems.map(
        ({ label, href, activeIconSrc, defaultIconSrc }) => {
          const isActive = isActivePath(pathname, href);
          const iconSrc = isActive ? activeIconSrc : defaultIconSrc;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className="text-caption flex min-w-0 flex-col items-center justify-center gap-1.5"
              href={href}
              key={href}
            >
              <Image
                alt=""
                aria-hidden="true"
                height={24}
                priority={isActive}
                src={iconSrc}
                width={24}
              />
              <span
                className={
                  isActive ? "text-grayscale-1000" : "text-grayscale-700"
                }
              >
                {label}
              </span>
            </Link>
          );
        },
      )}
    </nav>
  );
}
