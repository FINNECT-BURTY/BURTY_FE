"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  type AssetSummary,
  deriveDailySpendable,
  describeAssetState,
  fetchHomeOverview,
} from "@/features/home/api/homeOverview";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";
import { formatKoreanDate, formatWon } from "@/shared/ui/money";
import {
  normalizeRiskLevel,
  RiskBadge,
  riskLevelLabel,
} from "@/shared/ui/RiskBadge";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorState, StaleNotice } from "@/shared/ui/StateMessage";

export function HomeScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const fetcher = useCallback(() => fetchHomeOverview(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const assets = data?.assets ?? null;
  const forecast = data?.forecast ?? null;
  const risk = data?.risk ?? null;

  const spendable = deriveDailySpendable(forecast);
  const riskLevel = normalizeRiskLevel(risk?.level);
  const hasRisk = riskLevel !== "GREEN";

  /**
   * 현재 잔액 중 안전잔액을 뺀 여유의 비율.
   *
   * <p>이 막대는 "오늘 얼마나 썼는가" 가 <b>아니다.</b> 백엔드가 오늘 지출을 주지 않으므로
   * 그 값을 그릴 수 없다. 예전에는 "오늘 쓸 수 있는 금액" 바로 아래에 라벨 없이 두어
   * 오늘 예산 소진율처럼 읽혔다 — 막대가 라벨과 다른 것을 나타내고 있었다.
   * 지금은 무엇을 나타내는지 옆에 적는다.
   */
  const headroomRatio =
    spendable && forecast && forecast.openingBalance > 0
      ? Math.min(Math.max(spendable.usable / forecast.openingBalance, 0), 1)
      : 0;

  const handleResolveRisk = () => {
    router.push("/solution");
  };

  // 세 요청이 모두 실패했다면 보여줄 것이 없다. 일부만 실패한 경우는
  // 성공한 카드를 그대로 두고 해당 카드에서만 알린다.
  const allFailed = !isInitialLoading && !assets && !forecast && !risk;

  const assetState = describeAssetState(assets);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-2">
        {allFailed ? (
          <div className="mt-4 rounded-2xl bg-background py-6 shadow-1">
            <ErrorState
              message="자산 정보를 불러오지 못했어요"
              onRetry={refetch}
            />
          </div>
        ) : null}

        {/* 오늘 쓸 수 있는 돈 — 이 화면에서 가장 먼저 읽혀야 하는 값 */}
        <section className="flex min-h-[360px] flex-col rounded-2xl bg-background px-5 py-5 shadow-2">
          <div>
            <h1 className="text-title-lg text-grayscale-1000">
              안녕하세요 {user.displayName}님
            </h1>
            {isInitialLoading ? (
              <Skeleton className="mt-2 h-5 w-40" />
            ) : (
              <p className="text-body-md mt-1 text-grayscale-900">
                {describeMonthlySpend(assets)}
              </p>
            )}
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Image
              alt=""
              aria-hidden="true"
              height={150}
              priority
              src="/icons/main/character.svg"
              width={150}
            />
          </div>

          <div className="mt-auto">
            <p className="text-body-md text-grayscale-800">
              오늘 쓸 수 있는 금액
            </p>

            {isInitialLoading ? (
              <>
                <Skeleton className="mt-2 h-7 w-44" />
                <Skeleton className="mt-3 h-2 w-full rounded-full" />
              </>
            ) : spendable ? (
              <>
                <p className="text-display tabular-nums mt-1 text-grayscale-1000">
                  {formatWon(spendable.perDay)}
                </p>
                {/* 이 숫자가 어디서 나왔는지 밝힌다. 근거 없는 금액은 따르지 않는다. */}
                <p className="text-caption mt-1 text-grayscale-600">
                  안전잔액을 뺀 {formatWon(spendable.usable)}을 남은{" "}
                  {spendable.remainingDays}일로 나눈 금액이에요
                </p>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-caption text-grayscale-700">
                      잔액 중 쓸 수 있는 비율
                    </span>
                    <span className="text-caption tabular-nums text-grayscale-700">
                      {Math.round(headroomRatio * 100)}%
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-grayscale-100"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-200 to-yellow-400 transition-[width] duration-500"
                      style={{ width: `${headroomRatio * 100}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-body-md mt-1 text-grayscale-600">
                계좌를 연결하면 오늘 쓸 수 있는 금액을 알려드려요
              </p>
            )}
          </div>
        </section>

        {/* 이번 달 예상 상태 */}
        <section className="mt-4 rounded-2xl border border-grayscale-100 bg-background px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-title-sm text-grayscale-1000">
              이번 달 예상 상태
            </h2>
            {isInitialLoading ? (
              <Skeleton className="h-6 w-12 rounded-full" />
            ) : (
              <RiskBadge level={riskLevel} />
            )}
          </div>

          <div aria-hidden="true" className="mt-4 h-px bg-grayscale-100" />

          {isInitialLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-56" />
            </div>
          ) : risk ? (
            <div className="mt-4">
              <div className="flex items-center gap-1.5">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={16}
                  src={
                    hasRisk
                      ? "/icons/main/warning-orange.svg"
                      : "/icons/main/money.svg"
                  }
                  width={16}
                />
                <p className="text-body-md text-grayscale-800">
                  {hasRisk
                    ? "예상 위험이 있어요"
                    : `현재 ${riskLevelLabel(riskLevel)} 상태예요`}
                </p>
              </div>

              <p className="text-body-lg mt-1 text-grayscale-1000">
                {describeRisk(risk)}
              </p>

              {hasRisk ? (
                <BottomActionButton
                  className="mt-6"
                  onClick={handleResolveRisk}
                  textStyle="title-sm"
                >
                  지금 해결하기
                </BottomActionButton>
              ) : null}
            </div>
          ) : (
            <p className="text-body-md mt-4 text-grayscale-600">
              아직 예측할 정보가 부족해요
            </p>
          )}
        </section>

        {/* 총 자산 */}
        <section className="mt-4 flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Image
              alt=""
              aria-hidden="true"
              height={16}
              src="/icons/main/money.svg"
              width={16}
            />
            <h2 className="text-title-sm truncate text-grayscale-1000">
              총 자산
            </h2>
          </div>

          {isInitialLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            assetState.kind === "unlinked" ? (
              // 연결하지 않았으면 0원이 아니라 모름이다. 0원이라고 쓰면 자산이 없다고 읽힌다.
              <Link
                className="text-title-sm shrink-0 text-grayscale-900 underline underline-offset-4"
                href="/mypage/institutions"
              >
                연결하기
              </Link>
            ) : (
              <p className="text-title-sm tabular-nums shrink-0 text-grayscale-900">
                {assets ? formatWon(assets.totalAsset) : "-"}
                {assetState.kind === "linked" && assetState.partial ? (
                  // 일부 기관이 빠진 합계를 전체처럼 보여주지 않는다.
                  <span className="text-caption ml-1 text-grayscale-600">
                    일부 기관 제외
                  </span>
                ) : null}
              </p>
            )
          )}
        </section>

        {/* 값은 보여주되 최신이 아닐 수 있다는 것을 알린다. */}
        {error && !allFailed ? (
          <StaleNotice className="mt-4 justify-center" onRetry={refetch} />
        ) : null}
      </section>

      <BottomNavigation />
    </main>
  );
}

function describeMonthlySpend(assets: AssetSummary | null): string {
  if (describeAssetState(assets).kind === "unlinked") {
    return "자산을 연결하면 이번 달 지출을 알려드려요";
  }
  const monthlySpend = assets?.monthlySpend;
  if (monthlySpend === undefined || monthlySpend <= 0) {
    return "오늘도 버티와 함께 관리해요";
  }
  return `이번 달 ${formatWon(monthlySpend)} 쓰셨어요`;
}

function describeRisk(
  risk: Readonly<{
    projectedBalance: number;
    reason?: string | null;
    riskDate?: string | null;
  }>,
): string {
  if (!risk.riskDate) {
    return risk.reason?.trim()
      ? risk.reason
      : "이번 달은 잔액이 부족해질 위험이 없어요";
  }

  // 부족액은 예상 잔액이 음수일 때만 의미가 있다.
  const shortage = risk.projectedBalance < 0 ? Math.abs(risk.projectedBalance) : 0;
  const when = formatKoreanDate(risk.riskDate);

  return shortage > 0
    ? `${when}에 ${formatWon(shortage)} 부족할 예정이에요`
    : `${when}에 잔액이 ${formatWon(risk.projectedBalance)}까지 내려가요`;
}
