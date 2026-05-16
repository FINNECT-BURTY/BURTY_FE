"use client";

import { useState } from "react";

import { OnboardingExitConfirmModal } from "@/features/onboarding/components/OnboardingExitConfirmModal";
import { OnboardingHeader } from "@/shared/layout/OnboardingHeader";

type OnboardingConnectionScreenProps = Readonly<{
  onBack: () => void;
}>;

const connectionBenefits = [
  "월말 부족을 미리 알려드려요",
  "어디서 돈이 새는지 보여드려요",
  "지금 필요한 행동을 알려드려요",
] as const;

export function OnboardingConnectionScreen({
  onBack,
}: OnboardingConnectionScreenProps) {
  const [showRequiredDialog, setShowRequiredDialog] = useState(false);

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <OnboardingHeader onBack={onBack} title="자산 연결하기" />

      <section className="flex flex-1 flex-col px-6 pb-6 text-center">
        <h1 className="text-title-lg text-grayscale-1000">
          돈 흐름을 정확히 알려면
          <br />
          연결이 필요해요
        </h1>
        <p className="text-body-md mt-2 text-grayscale-900">
          버티는 월말 위험을 미리 알려드려요
        </p>

        <section className="mt-8 flex flex-col gap-4">
          {connectionBenefits.map((label) => (
            <div
              className="flex h-16 items-center gap-4 rounded-2xl bg-yellow-200 px-5 text-left"
              key={label}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-background">
                ✓
              </span>
              <span className="text-body-md text-grayscale-1000">{label}</span>
            </div>
          ))}
        </section>

        <p className="text-caption mt-4 text-grayscale-1000">
          은행 수준으로 안전하게 보호됩니다
        </p>
        <p className="text-body-md mx-auto text-grayscale-900">
          사용자 동의 없이 이체, 결제, 대출 신청은 실행되지 않아요.
        </p>

        <button
          className="text-caption mx-auto mt-8 border-b border-grayscale-800 pb-0.5 text-grayscale-800"
          onClick={() => setShowRequiredDialog(true)}
          type="button"
        >
          나중에 할게요
        </button>

        <footer className="mt-auto">
          <button
            className="text-title-sm flex h-[52px] w-full items-center justify-center rounded-2xl bg-yellow-400 text-grayscale-1000"
            type="button"
          >
            연결하기
          </button>
        </footer>
      </section>

      {showRequiredDialog ? (
        <OnboardingExitConfirmModal
          onPrimary={() => setShowRequiredDialog(false)}
          primaryLabel="확인"
          title={"자산을 연결하지 않으면\n버티를 이용할 수 없어요"}
        />
      ) : null}
    </main>
  );
}
