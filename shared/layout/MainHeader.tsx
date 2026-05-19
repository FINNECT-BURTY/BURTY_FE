import Image from "next/image";
import Link from "next/link";

import { Header } from "@/shared/layout/Header";

export function MainHeader() {
  return (
    <Header
      leftClassName="text-title-md min-w-0 flex-1 text-grayscale-1000"
      leftSlot="BURTY"
      rightSlot={
        <Link
          aria-label="알림 보기"
          className="flex size-10 items-center justify-center"
          href="/notifications"
        >
          <Image
            alt=""
            aria-hidden="true"
            height={24}
            src="/icons/header/alarm.svg"
            width={24}
          />
        </Link>
      }
    />
  );
}
