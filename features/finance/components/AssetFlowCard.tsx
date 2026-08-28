"use client";

import Image from "next/image";
import Link from "next/link";

import { toAssetFlowPoints } from "@/features/finance/api/assetFlow";
import { AssetFlowChart } from "@/features/finance/components/AssetFlowChart";
import type { CashflowForecast } from "@/features/home/api/homeOverview";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { formatKoreanDate, formatWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";

type AssetFlowCardProps = Readonly<{
  forecast: CashflowForecast | null;
  isLoading: boolean;
}>;

export function AssetFlowCard({ forecast, isLoading }: AssetFlowCardProps) {
  const { user } = useCurrentUser();
  const points = toAssetFlowPoints(forecast?.dailyBalances);
  const hasRisk = Boolean(forecast?.riskDate);

  return (
    <section className="rounded-2xl bg-background px-4 py-5 shadow-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-52" />
              <Skeleton className="mt-2 h-4 w-40" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={20}
                  src={
                    hasRisk
                      ? "/icons/main/warning-red.svg"
                      : "/icons/main/money.svg"
                  }
                  width={20}
                />
                <h2 className="text-title-md min-w-0 text-grayscale-1000">
                  {hasRisk
                    ? `${user.displayName}님 예상 위험이 있어요`
                    : `${user.displayName}님 이번 달은 안정적이에요`}
                </h2>
              </div>
              <p className="text-body-md mt-1 text-grayscale-900">
                {describeForecast(forecast)}
              </p>
            </>
          )}
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

      {isLoading ? (
        <Skeleton className="mt-4 h-[148px] w-full rounded-xl" />
      ) : (
        <AssetFlowChart
          className="mt-2"
          interactive
          points={points}
          riskDate={forecast?.riskDate}
          safetyBalance={forecast?.safetyBalance}
        />
      )}
    </section>
  );
}

function describeForecast(forecast: CashflowForecast | null): string {
  if (!forecast) return "계좌를 연결하면 예상 흐름을 알려드려요";

  if (!forecast.riskDate) {
    return `이번 달 최저 예상 잔액은 ${formatWon(forecast.minimumBalance)}이에요`;
  }

  const when = formatKoreanDate(forecast.riskDate);
  const shortage =
    forecast.minimumBalance < 0 ? Math.abs(forecast.minimumBalance) : 0;

  return shortage > 0
    ? `${when}에 ${formatWon(shortage)}이 부족할 예정이에요`
    : `${when}에 잔액이 ${formatWon(forecast.minimumBalance)}까지 내려가요`;
}
