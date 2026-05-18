"use client";

import { ChevronRight } from "lucide-react";

import { AppTopBar } from "@/features/main/components/AppTopBar";
import { useFinancialOverview } from "@/features/main/hooks/useFinancialOverview";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";

const solutionOptions = [
  {
    title: "결제일 변경하기",
    description: "목돈을 아낄 수 있어요",
  },
  {
    title: "비상금 분리하기",
    description: "예상치 못한 지출을 막을 수 있어요",
  },
  {
    title: "상환 우선순위 조정하기",
    description: "나에게 가장 유리한 순서로 대출을 갚아요",
  },
] as const;

export function SolutionScreen() {
  const { overview } = useFinancialOverview();

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <AppTopBar />

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <h1 className="text-title-md mt-1 text-grayscale-1000">솔루션</h1>

        <section className="mt-3 rounded-2xl border border-grayscale-100 bg-background p-5 text-center shadow-[0_2px_12px_rgba(30,30,30,0.04)]">
          <div className="text-left">
            <h2 className="text-title-md text-grayscale-1000">
              {overview.action.title}
            </h2>
            <p className="text-body-md mt-1 text-grayscale-800">
              {overview.action.description}
            </p>
          </div>

          <div className="mx-auto mt-8 flex size-[132px] items-center justify-center rounded-full bg-[#8a6a5a] text-[82px] leading-none">
            🍲
          </div>

          <button
            className="text-title-sm mt-8 flex h-[52px] w-full items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000"
            type="button"
          >
            지금 해결하기
          </button>
        </section>

        <section className="mt-7">
          <h2 className="text-title-md text-grayscale-1000">다른 방법도 있어요</h2>
          <div className="mt-4 flex flex-col gap-4">
            {solutionOptions.map((option) => (
              <button
                className="flex min-h-[88px] items-center justify-between gap-4 rounded-2xl border border-grayscale-100 bg-background px-5 text-left"
                key={option.title}
                type="button"
              >
                <span>
                  <span className="text-body-md block text-grayscale-1000">
                    {option.title}
                  </span>
                  <span className="text-caption mt-1 block text-grayscale-800">
                    {option.description}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="shrink-0 text-grayscale-900"
                  size={24}
                  strokeWidth={1.8}
                />
              </button>
            ))}
          </div>
        </section>
      </section>

      <BottomNavigation />
    </main>
  );
}
