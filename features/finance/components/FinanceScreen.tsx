"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import {
  type CashflowSchedule,
  fetchAssetFlow,
  scheduleDateInMonth,
  scheduleDirection,
  signedScheduleAmount,
} from "@/features/finance/api/assetFlow";
import { AssetFlowCard } from "@/features/finance/components/AssetFlowCard";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { formatMonthDay, formatSignedWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, StaleNotice } from "@/shared/ui/StateMessage";

type ScheduleFilter = "all" | "in" | "out";

const filterItems: readonly Readonly<{
  label: string;
  value: ScheduleFilter;
}>[] = [
  { label: "전체", value: "all" },
  { label: "수입", value: "in" },
  { label: "지출", value: "out" },
];

export function FinanceScreen() {
  const [selectedFilter, setSelectedFilter] = useState<ScheduleFilter>("all");

  const fetcher = useCallback(() => fetchAssetFlow(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const forecast = data?.forecast ?? null;
  const riskDate = forecast?.riskDate ?? null;

  // 일정은 dayOfMonth 만 오므로 화면에서 이번 달 날짜로 만들고 정렬한다.
  // 정렬하지 않으면 등록 순서대로 나와 "다음에 무엇이 오는가" 를 읽을 수 없다.
  const schedules = useMemo(() => {
    const items = data?.schedules ?? [];
    return items
      .filter((item) => item.active)
      .map((item) => ({
        item,
        date: scheduleDateInMonth(item.dayOfMonth),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data?.schedules]);

  const visibleSchedules = useMemo(
    () =>
      selectedFilter === "all"
        ? schedules
        : schedules.filter(
            ({ item }) => scheduleDirection(item) === selectedFilter,
          ),
    [schedules, selectedFilter],
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-2">
        <h1 className="text-title-md text-grayscale-1000">자산 흐름</h1>

        <div className="mt-2">
          <AssetFlowCard forecast={forecast} isLoading={isInitialLoading} />
        </div>

        {/* 이체 진입점. 자산을 보다가 바로 보낼 수 있어야 한다. */}
        <Link
          className="mt-3 flex min-h-14 items-center justify-between rounded-2xl border border-grayscale-100 bg-background px-5"
          href="/transfer"
        >
          <span className="flex items-center gap-1.5">
            <Image
              alt=""
              aria-hidden="true"
              height={16}
              src="/icons/main/money.svg"
              width={16}
            />
            <span className="text-title-sm text-grayscale-1000">이체하기</span>
          </span>
          <Image
            alt=""
            aria-hidden="true"
            height={17}
            src="/icons/finance/right-arrow-gray-800.svg"
            width={12}
          />
        </Link>

        <section className="mt-6">
          <div className="flex items-center gap-1.5">
            <Image
              alt=""
              aria-hidden="true"
              height={20}
              src="/icons/main/money.svg"
              width={20}
            />
            <h2 className="text-title-md text-grayscale-1000">
              지출 및 수입 일정
            </h2>
          </div>

          <div className="mt-2 flex gap-2" role="group">
            {filterItems.map((item) => {
              const isSelected = item.value === selectedFilter;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`text-body-md h-9 rounded-2xl border px-4 transition-colors ${
                    isSelected
                      ? "border-grayscale-1000 bg-grayscale-1000 text-background"
                      : "border-grayscale-200 bg-background text-grayscale-800"
                  }`}
                  key={item.value}
                  onClick={() => setSelectedFilter(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {isInitialLoading ? (
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  className="flex min-h-[72px] items-center justify-between rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                  key={index}
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : visibleSchedules.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-grayscale-100 bg-background">
              <EmptyState
                description={
                  schedules.length === 0
                    ? "급여일이나 고정 지출을 등록하면 흐름을 더 정확히 예측해요"
                    : undefined
                }
                title={
                  schedules.length === 0
                    ? "등록된 일정이 없어요"
                    : "해당하는 일정이 없어요"
                }
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {visibleSchedules.map(({ date, item }) => (
                <li key={item.scheduleId}>
                  <ScheduleRow
                    date={date}
                    isRisk={isRiskSchedule(item, date, riskDate)}
                    schedule={item}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {error ? (
          <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
        ) : null}
      </section>

      <BottomNavigation />
    </main>
  );
}

function ScheduleRow({
  date,
  isRisk,
  schedule,
}: Readonly<{
  date: Date;
  isRisk: boolean;
  schedule: CashflowSchedule;
}>) {
  const direction = scheduleDirection(schedule);
  const amount = signedScheduleAmount(schedule);

  return (
    <article
      className={`flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border bg-background px-5 py-5 ${
        isRisk ? "border-red/30" : "border-grayscale-100"
      }`}
    >
      <div className="min-w-0">
        {isRisk ? (
          <p className="text-caption mb-2 text-red">위험 발생 예정</p>
        ) : null}
        <h3 className="text-title-xs truncate text-grayscale-1000">
          {schedule.label}
        </h3>
        <p className="text-caption text-grayscale-900">
          {formatMonthDay(toIsoDate(date))}
        </p>
      </div>

      {/*
        수입만 초록으로 강조한다. 지출을 빨강으로 칠하면 정상적인 월세·카드값이
        전부 경고로 읽혀, 정작 진짜 위험 표시가 묻힌다.
      */}
      <p
        className={`text-body-md tabular-nums shrink-0 ${
          direction === "in" ? "text-green" : "text-grayscale-1000"
        }`}
      >
        {formatSignedWon(amount)}
      </p>
    </article>
  );
}

/** 예측상 위험한 날에 잡힌 지출이면 목록에서도 표시한다. */
function isRiskSchedule(
  schedule: CashflowSchedule,
  date: Date,
  riskDate: string | null,
): boolean {
  if (!riskDate) return false;
  if (scheduleDirection(schedule) !== "out") return false;
  return toIsoDate(date) === riskDate;
}

function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
