"use client";

import Image from "next/image";
import Link from "next/link";

import { AssetFlowChart } from "@/features/finance/components/AssetFlowChart";
import { useCurrentUser } from "@/shared/auth/currentUser";

export function AssetFlowCard() {
  const { user } = useCurrentUser();

  return (
    <section className="rounded-2xl bg-background px-4 py-5 shadow-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Image
              alt=""
              height={20}
              src="/icons/main/warning-yellow.svg"
              width={20}
            />
            <h2 className="text-title-md text-grayscale-1000">
              {user.displayName}님 예상 위험이 있어요
            </h2>
          </div>
          <p className="text-body-md mt-1 text-grayscale-900">
            25일에 -12,000원이 부족할 예정이에요
          </p>
        </div>
        <Link
          aria-label="자산 흐름 상세 보기"
          className="flex size-8 shrink-0 items-start justify-end pt-0.5"
          href="/finance/risk"
        >
          <Image
            alt=""
            aria-hidden="true"
            height={17}
            src="/icons/finance/right-arrow-gray-800.svg"
            width={12}
          />
        </Link>
      </div>

      <AssetFlowChart className="mt-2" interactive />
    </section>
  );
}
