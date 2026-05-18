"use client";

import { useState } from "react";

import { AppTopBar } from "@/features/main/components/AppTopBar";
import { FilterTabs } from "@/features/main/components/FilterTabs";
import { RiskForecastCard } from "@/features/main/components/RiskForecastCard";
import { ScheduleCard } from "@/features/main/components/ScheduleCard";
import { useFinancialOverview, type ScheduleType } from "@/features/main/hooks/useFinancialOverview";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";

type ScheduleFilter = "all" | ScheduleType;

const scheduleTabs = [
  { label: "전체", value: "all" },
  { label: "수입", value: "income" },
  { label: "지출", value: "expense" },
] as const;

export function FinanceScreen() {
  const { overview } = useFinancialOverview();
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const schedules = overview.schedules.filter((schedule) =>
    filter === "all" ? true : schedule.type === filter,
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <AppTopBar />

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <h1 className="text-title-md mt-1 text-grayscale-1000">자산 흐름</h1>

        <div className="mt-3">
          <RiskForecastCard
            href="/finance/risk"
            subtitle={overview.riskSubtitle}
            title={overview.riskTitle}
          />
        </div>

        <section className="mt-7">
          <h2 className="text-title-md text-grayscale-1000">지출 및 수입 일정</h2>
          <div className="mt-3">
            <FilterTabs tabs={scheduleTabs} value={filter} onChange={setFilter} />
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                amount={schedule.amount}
                dateLabel={schedule.dateLabel}
                key={schedule.id}
                risky={schedule.risky}
                title={schedule.title}
              />
            ))}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
