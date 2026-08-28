"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { toAssetFlowPoints } from "@/features/finance/api/assetFlow";
import {
  fetchRiskDetail,
  type WeightedRiskCause,
  weightRiskCauses,
} from "@/features/finance/api/riskDetail";
import { AssetFlowChart } from "@/features/finance/components/AssetFlowChart";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { formatKoreanDate, formatWon } from "@/shared/ui/money";
import { Skeleton, SkeletonLines } from "@/shared/ui/Skeleton";
import { EmptyState, StaleNotice } from "@/shared/ui/StateMessage";

/** 원인 막대 색. 영향이 큰 항목부터 진한 색을 준다. */
const causeToneClassNames = [
  "bg-yellow-400",
  "bg-yellow-300",
  "bg-yellow-200",
  "bg-grayscale-200",
] as const;

function causeTone(index: number): string {
  return causeToneClassNames[Math.min(index, causeToneClassNames.length - 1)];
}

export function RiskDetailScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const fetcher = useCallback(() => fetchRiskDetail(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const forecast = data?.forecast ?? null;
  const causes = weightRiskCauses(data?.causes ?? []);
  const hasRisk = Boolean(forecast?.riskDate);

  const handleBack = () => {
    router.back();
  };

  const handleResolveRisk = () => {
    router.push("/solution");
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={handleBack} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="위험 상세 보기"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        <article className="rounded-2xl bg-background px-5 pt-5 shadow-2">
          {isInitialLoading ? (
            <>
              <Skeleton className="h-5 w-52" />
              <Skeleton className="mt-2 h-4 w-44" />
              <Skeleton className="mt-4 h-[148px] w-full rounded-xl" />
            </>
          ) : (
            <>
              <h1 className="text-title-md text-grayscale-1000">
                {hasRisk
                  ? `${user.displayName}님 예상 위험이 있어요`
                  : `${user.displayName}님 이번 달은 안정적이에요`}
              </h1>
              <p className="text-body-md mt-1 text-grayscale-900">
                {describeShortage(forecast)}
              </p>
              <AssetFlowChart
                className="mt-2"
                interactive
                points={toAssetFlowPoints(forecast?.dailyBalances)}
                riskDate={forecast?.riskDate}
                safetyBalance={forecast?.safetyBalance}
              />
            </>
          )}
        </article>

        <article className="mt-6 rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
          <h2 className="text-title-sm text-grayscale-1000">
            주요 원인을 분석해 봤어요
          </h2>

          {isInitialLoading ? (
            <>
              <Skeleton className="mt-4 h-4 w-full rounded-full" />
              <SkeletonLines className="mt-4" lines={3} />
            </>
          ) : causes.length === 0 ? (
            <EmptyState
              className="py-6"
              description="고정 지출 일정을 등록하면 원인을 분석해 드려요"
              title="분석할 원인이 아직 없어요"
            />
          ) : (
            <CauseBreakdown causes={causes} />
          )}
        </article>

        {!isInitialLoading && causes.some((cause) => cause.reason?.trim()) ? (
          <article className="mt-6 rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
            <div className="flex items-center gap-1.5">
              <Image
                alt=""
                aria-hidden="true"
                height={16}
                src="/icons/main/pencil.svg"
                width={16}
              />
              <h2 className="text-title-sm text-grayscale-1000">
                원인을 설명해 드릴게요
              </h2>
            </div>
            <ul className="mt-2 space-y-2">
              {causes
                .filter((cause) => cause.reason?.trim())
                .map((cause) => (
                  <li
                    className="text-body-md text-grayscale-900"
                    key={cause.causeType}
                  >
                    <span className="text-grayscale-1000">{cause.label}</span>{" "}
                    {cause.reason}
                  </li>
                ))}
            </ul>
          </article>
        ) : null}

        {hasRisk ? (
          <article className="mt-6 rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
            <div className="flex items-center gap-1.5">
              <Image
                alt=""
                aria-hidden="true"
                height={16}
                src="/icons/main/warning-orange.svg"
                width={16}
              />
              <h2 className="text-title-sm text-grayscale-1000">
                주의해 주세요
              </h2>
            </div>
            <p className="text-body-md mt-2 text-grayscale-900">
              이 상태로는 결제 실패 가능성이 있어요. 연체 수수료가 발생할 수
              있으니 미리 준비해두세요.
            </p>
          </article>
        ) : null}

        {error ? (
          <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
        ) : null}
      </section>

      <BottomActionBar
        actionLabel="지금 해결하기"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        onAction={handleResolveRisk}
      />
    </main>
  );
}

function CauseBreakdown({
  causes,
}: Readonly<{ causes: readonly WeightedRiskCause[] }>) {
  return (
    <>
      <div
        aria-label="부족 원인 비율"
        className="mt-4 flex h-4 overflow-hidden rounded-full bg-grayscale-100"
        role="img"
      >
        {causes.map((cause, index) => (
          <div
            aria-hidden="true"
            className={causeTone(index)}
            key={cause.causeType}
            // 비율은 실제 영향액에서 나온다. 고정 폭으로 그리면 비율 막대가 거짓말을 한다.
            style={{ width: `${cause.share * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {causes.map((cause, index) => (
          <li className="flex items-center gap-1" key={cause.causeType}>
            <span
              aria-hidden="true"
              className={`size-2 rounded-sm ${causeTone(index)}`}
            />
            <span className="text-caption text-grayscale-900">
              {cause.label}
            </span>
          </li>
        ))}
      </ul>

      <ul className="mt-4 space-y-4">
        {causes.map((cause) => (
          <li
            className="flex items-center justify-between gap-3"
            key={cause.causeType}
          >
            <span className="text-body-md min-w-0 truncate text-grayscale-1000">
              {cause.label}
            </span>
            <span className="text-body-md tabular-nums shrink-0 text-grayscale-1000">
              {formatWon(-Math.abs(cause.impactAmount))}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function describeShortage(
  forecast: Readonly<{
    minimumBalance?: number;
    riskDate?: string | null;
  }> | null,
): string {
  if (!forecast) return "예측할 잔액 정보가 아직 없어요";

  const minimum = forecast.minimumBalance ?? 0;

  if (!forecast.riskDate) {
    return `이번 달 최저 예상 잔액은 ${formatWon(minimum)}이에요`;
  }

  const when = formatKoreanDate(forecast.riskDate);
  return minimum < 0
    ? `${when}에 ${formatWon(Math.abs(minimum))}이 부족할 예정이에요`
    : `${when}에 잔액이 ${formatWon(minimum)}까지 내려가요`;
}
