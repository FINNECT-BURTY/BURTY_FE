"use client";

import { useState } from "react";

import { AssetFlowCard } from "@/features/finance/components/AssetFlowCard";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";

type ScheduleType = "expense" | "income";
type ScheduleFilter = "all" | ScheduleType;

type ScheduleItem = Readonly<{
  id: string;
  amount: number;
  date: string;
  isRisk?: boolean;
  title: string;
  type: ScheduleType;
}>;

const filterItems: readonly Readonly<{
  label: string;
  value: ScheduleFilter;
}>[] = [
  { label: "전체", value: "all" },
  { label: "수입", value: "income" },
  { label: "지출", value: "expense" },
];

const scheduleItems: readonly ScheduleItem[] = [
  {
    id: "payday-1",
    amount: 250000,
    date: "3.7",
    title: "급여일",
    type: "income",
  },
  {
    id: "card",
    amount: -250000,
    date: "3.7",
    title: "카드값",
    type: "expense",
  },
  {
    id: "rent",
    amount: -250000,
    date: "3.16",
    isRisk: true,
    title: "월세",
    type: "expense",
  },
  {
    id: "interest",
    amount: 300,
    date: "3.18",
    title: "이자",
    type: "income",
  },
  {
    id: "payday-2",
    amount: 250000,
    date: "3.7",
    title: "급여일",
    type: "income",
  },
];

function formatAmount(value: number) {
  const formatted = Math.abs(value).toLocaleString("ko-KR");
  return `${value > 0 ? "+" : "-"}${formatted}원`;
}

function getVisibleSchedules(filter: ScheduleFilter) {
  if (filter === "all") return scheduleItems;
  return scheduleItems.filter((item) => item.type === filter);
}

export function FinanceScreen() {
  const [selectedFilter, setSelectedFilter] = useState<ScheduleFilter>("all");
  const visibleSchedules = getVisibleSchedules(selectedFilter);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-2">
        <h1 className="text-title-md text-grayscale-1000">자산 흐름</h1>

        <div className="mt-2">
          <AssetFlowCard />
        </div>

        <section className="mt-1">
          <h2 className="text-title-md text-grayscale-1000">
            지출 및 수입 일정
          </h2>

          <div className="mt-3 flex gap-2">
            {filterItems.map((item) => {
              const isSelected = item.value === selectedFilter;

              return (
                <button
                  className={`text-body-md h-9 rounded-2xl border px-4 ${
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

          <div className="mt-4 space-y-4">
            {visibleSchedules.map((item) => (
              <article
                className="flex min-h-[72px] items-center justify-between bg-background px-5 py-5"
                key={item.id}
              >
                <div className="min-w-0">
                  {item.isRisk ? (
                    <p className="text-caption mb-2 text-red">위험 발생 예정</p>
                  ) : null}
                  <h3 className="text-body-md text-grayscale-1000">
                    {item.title}
                  </h3>
                  <p className="text-caption text-grayscale-900">
                    {item.date}
                  </p>
                </div>
                <p className="text-body-md shrink-0 text-grayscale-1000">
                  {formatAmount(item.amount)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
