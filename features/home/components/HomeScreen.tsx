import { AlertTriangle, Building2, TrendingDown } from "lucide-react";

import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";

const summaryItems = [
  {
    label: "이번보다",
    value: "12% 절약",
    Icon: TrendingDown,
  },
  {
    label: "총 자산",
    value: "₩ 2.4M",
    Icon: Building2,
  },
] as const;

export function HomeScreen() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto bg-grayscale-100 px-6 pb-7 pt-6">
        <div>
          <h1 className="text-title-lg text-grayscale-1000">
            오늘 괜찮아요?
          </h1>
          <p className="text-body-md mt-1 text-grayscale-900">
            버티님이 궁금해하는 금융 리포트입니다.
          </p>
        </div>

        <section className="mt-6 rounded-lg border border-grayscale-200 bg-background px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-grayscale-200 bg-background text-grayscale-1000">
              <AlertTriangle
                aria-hidden="true"
                size={20}
                fill="currentColor"
                strokeWidth={2}
              />
            </span>
            <div className="min-w-0">
              <p className="text-caption text-grayscale-900">
                가장 위험한 날짜
              </p>
              <p className="text-title-sm mt-1 text-grayscale-1000">
                10월 25일: 카드값과 월세가 겹쳐요
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-grayscale-200 bg-background px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-caption text-grayscale-900">
                이번 달 상태
              </p>
            </div>
            <span className="text-caption rounded-full bg-grayscale-1000 px-3 py-1 text-background">
              주의
            </span>
          </div>

          <div className="mt-6">
            <p className="text-caption text-grayscale-900">
              오늘 소비 가능 금액
            </p>
            <p className="text-display mt-1 text-grayscale-1000">
              ₩14,200
            </p>
          </div>

          <div className="my-5 h-px bg-grayscale-100" />

          <div>
            <p className="text-caption text-grayscale-900">
              월말 예상 잔액
            </p>
            <p className="text-title-md mt-1 text-grayscale-1000">
              ₩124,500
            </p>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {summaryItems.map(({ label, value, Icon }) => (
            <section
              className="rounded-lg border border-grayscale-200 bg-background px-4 py-4 text-grayscale-1000"
              key={label}
            >
              <Icon aria-hidden="true" size={22} strokeWidth={2} />
              <p className="text-caption mt-2 text-grayscale-900">
                {label}
              </p>
              <p className="text-title-md mt-1">{value}</p>
            </section>
          ))}
        </div>

        <button
          className="text-title-sm mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-grayscale-1000 px-6 text-background"
          type="button"
        >
          지금 해결하기
        </button>
      </section>

      <BottomNavigation />
    </main>
  );
}
