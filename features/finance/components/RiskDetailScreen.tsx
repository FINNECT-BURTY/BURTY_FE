"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { RiskForecastCard } from "@/features/main/components/RiskForecastCard";
import { formatWon } from "@/features/main/components/ScheduleCard";
import { useFinancialOverview } from "@/features/main/hooks/useFinancialOverview";

function CauseBar() {
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-grayscale-100">
        <span className="w-[23%] bg-yellow-400" />
        <span className="w-[22%] bg-yellow-300" />
        <span className="w-[44%] bg-yellow-200" />
      </div>
      <div className="text-caption mt-4 flex justify-center gap-5 text-grayscale-700">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-yellow-400" />
          카드값
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-yellow-300" />
          월세
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-yellow-200" />
          기타 고정비
        </span>
      </div>
    </div>
  );
}

export function RiskDetailScreen() {
  const router = useRouter();
  const { overview } = useFinancialOverview();

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <header className="flex h-16 shrink-0 items-center px-5">
        <button
          aria-label="뒤로가기"
          className="-ml-2 flex size-10 items-center justify-center text-grayscale-1000"
          onClick={() => router.back()}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={24} strokeWidth={1.8} />
        </button>
        <div className="text-title-md min-w-0 flex-1 pr-10 text-center">
          위험 상세 보기
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <RiskForecastCard
          subtitle={overview.riskSubtitle}
          title={overview.riskTitle}
        />

        <section className="mt-6 rounded-2xl border border-grayscale-100 bg-background p-5">
          <h2 className="text-title-sm text-grayscale-1000">
            주요 원인을 분석해 봤어요
          </h2>
          <div className="mt-5">
            <CauseBar />
          </div>
          <div className="mt-6 flex flex-col gap-5">
            {overview.causes.map((cause) => (
              <div className="flex justify-between gap-4" key={cause.label}>
                <span className="text-body-md text-grayscale-1000">{cause.label}</span>
                <span className="text-body-md text-grayscale-1000">
                  {formatWon(cause.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-grayscale-100 bg-background p-5">
          <h2 className="text-title-sm text-grayscale-1000">원인을 설명해 드릴게요</h2>
          <p className="text-body-md mt-3 text-grayscale-800">{overview.explanation}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-grayscale-100 bg-background p-5">
          <h2 className="text-title-sm text-grayscale-1000">주의해 주세요</h2>
          <p className="text-body-md mt-3 text-grayscale-800">{overview.warning}</p>
        </section>
      </section>

      <footer className="shrink-0 border-t border-grayscale-100 bg-background px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
        <button
          className="text-title-sm flex h-[52px] w-full items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000"
          onClick={() => router.push("/solution")}
          type="button"
        >
          지금 해결하기
        </button>
      </footer>
    </main>
  );
}
