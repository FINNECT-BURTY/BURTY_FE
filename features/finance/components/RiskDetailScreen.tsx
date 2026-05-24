"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { AssetFlowChart } from "@/features/finance/components/AssetFlowChart";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";

type CauseItem = Readonly<{
  amount: number;
  colorClassName: string;
  label: string;
  widthClassName: string;
}>;

const causeItems: readonly CauseItem[] = [
  {
    amount: -80000,
    colorClassName: "bg-yellow-400",
    label: "카드값",
    widthClassName: "w-[25%]",
  },
  {
    amount: -80000,
    colorClassName: "bg-yellow-300",
    label: "월세",
    widthClassName: "w-[25%]",
  },
  {
    amount: -80000,
    colorClassName: "bg-yellow-200",
    label: "기타 고정비",
    widthClassName: "w-[25%]",
  },
];

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function RiskDetailScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

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
        <article className="bg-background px-5 pt-5 rounded-2xl shadow-1">
          <h1 className="text-title-md text-grayscale-1000">
            {user.displayName}님 예상 위험이 있어요
          </h1>
          <p className="text-body-md mt-1 text-grayscale-900">
            25일에 -12,000원이 부족할 예정이에요
          </p>
          <AssetFlowChart className="mt-2" interactive />
        </article>

        <article className="mt-6 bg-background px-5 py-4 rounded-2xl border border-grayscale-100">
          <h2 className="text-title-sm text-grayscale-1000">
            주요 원인을 분석해 봤어요
          </h2>

          <div
            aria-label="부족 원인 비율"
            className="mt-4 flex h-4 overflow-hidden rounded-full bg-grayscale-100"
          >
            {causeItems.map((item) => (
              <div
                aria-hidden="true"
                className={`${item.widthClassName} ${item.colorClassName}`}
                key={item.label}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-4">
            {causeItems.map((item) => (
              <div className="flex items-center gap-1" key={item.label}>
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-sm ${item.colorClassName}`}
                />
                <span className="text-caption text-grayscale-900">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {causeItems.map((item) => (
              <div className="flex items-center justify-between" key={item.label}>
                <span className="text-body-md text-grayscale-1000">
                  {item.label}
                </span>
                <span className="text-body-md text-grayscale-1000">
                  {formatWon(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="mt-6 bg-background px-5 py-4 rounded-2xl border border-grayscale-100">
          <div className="flex items-center gap-1.5">
            <Image
              alt=""
              height={16}
              src="/icons/main/pencil.svg"
              width={16}
            />
            <h2 className="text-title-sm text-grayscale-1000">
              원인을 설명해 드릴게요
            </h2>
          </div>
          <p className="text-body-md mt-2 text-grayscale-900">
            카드값과 월세가 같은 주에 빠져나가면서 부족이 발생합니다.
            25일은 지출이 집중되는 날입니다.
          </p>
        </article>

        <article className="mt-6 bg-background px-5 py-4 rounded-2xl border border-grayscale-100">
          <div className="flex items-center gap-1.5">
            <Image
              alt=""
              height={16}
              src="/icons/main/warning-orange.svg"
              width={16}
            />
            <h2 className="text-title-sm text-grayscale-1000">주의해 주세요</h2>
          </div>
          <p className="text-body-md mt-2 text-grayscale-900">
            이 상태로는 결제 실패 가능성이 있어요. 연체 수수료가 발생할
            수 있으니 주의하세요.
          </p>
        </article>
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
