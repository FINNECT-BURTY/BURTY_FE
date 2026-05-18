"use client";

import { useState } from "react";

import { AppTopBar } from "@/features/main/components/AppTopBar";
import { FilterTabs } from "@/features/main/components/FilterTabs";
import {
  useFinancialOverview,
  type GrantPolicy,
} from "@/features/main/hooks/useFinancialOverview";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";

type GrantFilter = "all" | GrantPolicy["category"];

const grantTabs = [
  { label: "전체", value: "all" },
  { label: "주거", value: "housing" },
  { label: "금융", value: "finance" },
  { label: "생활비", value: "living" },
] as const;

function GrantHeroBanner() {
  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-[#bfe0d8] px-4 py-4 text-center">
      <div className="text-title-sm mx-auto w-fit rounded bg-[#06aa91] px-2 py-1 text-white">
        2026 서울시
      </div>
      <p className="mt-1 text-[30px] font-extrabold leading-[1.15] text-[#00a78f]">
        청년월세지원
      </p>
      <p className="text-title-sm mt-2 text-[#00a78f]">
        2026. 5. 11. (수) ~ 5. 24. (화) 18:00
      </p>
    </div>
  );
}

export function GrantScreen() {
  const { overview } = useFinancialOverview();
  const [filter, setFilter] = useState<GrantFilter>("all");
  const policies = overview.policies.filter((policy) =>
    filter === "all" ? true : policy.category === filter,
  );
  const mainPolicy = policies[0] ?? overview.policies[0];

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <AppTopBar />

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <h1 className="text-title-md mt-1 text-grayscale-1000">
          지원금 알아보기
        </h1>

        <section className="mt-5 rounded-2xl border border-grayscale-100 bg-background p-5 shadow-[0_2px_12px_rgba(30,30,30,0.04)]">
          <h2 className="text-title-md text-grayscale-1000">
            3일 뒤 신청 마감되는 지원 정책이 있어요
          </h2>
          <p className="text-body-md mt-2 text-grayscale-1000">
            {mainPolicy.tags.join(" ")}
          </p>
          <GrantHeroBanner />
          <button
            className="text-title-sm mt-5 flex h-[48px] w-full items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000"
            type="button"
          >
            신청하기
          </button>
        </section>

        <section className="mt-7">
          <h2 className="text-title-md text-grayscale-1000">
            다른 지원 제도도 소개해 드릴게요
          </h2>
          <div className="mt-4">
            <FilterTabs tabs={grantTabs} value={filter} onChange={setFilter} />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {policies.map((policy) => (
              <section
                className="flex min-h-[104px] items-center justify-between gap-4 rounded-2xl border border-grayscale-100 bg-background px-5 py-4"
                key={policy.id}
              >
                <div className="min-w-0">
                  <h3 className="text-body-md text-grayscale-1000">
                    {policy.title}
                  </h3>
                  <p className="text-caption mt-1 text-grayscale-800">
                    {policy.description}
                  </p>
                  <p className="text-caption mt-1 text-grayscale-700">
                    {policy.deadline}
                  </p>
                </div>
                <button
                  className="text-body-md flex h-10 shrink-0 items-center justify-center rounded-full bg-grayscale-1000 px-4 text-background"
                  type="button"
                >
                  신청하기
                </button>
              </section>
            ))}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
