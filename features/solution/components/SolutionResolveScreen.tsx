"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";

const SOLUTION_STEP_TIMINGS_MS = [800, 1600] as const;
const SOLUTION_IMAGE_SRC = "/icons/solution/food.svg";

type SolutionStep = 0 | 1 | 2;

function getStepClassName(active: boolean) {
  return `absolute inset-0 flex transition-opacity duration-[400ms] ease-out ${
    active ? "opacity-100" : "opacity-0"
  }`;
}

function getTextClassName(active: boolean) {
  return `mt-6 text-center transition-opacity duration-[400ms] ease-out ${
    active ? "opacity-100" : "opacity-0"
  }`;
}

export function SolutionResolveScreen() {
  const router = useRouter();
  const [step, setStep] = useState<SolutionStep>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return undefined;

    const timers = SOLUTION_STEP_TIMINGS_MS.map((delay, index) =>
      window.setTimeout(() => {
        setStep((index + 1) as SolutionStep);
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isCompleted]);

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.replace("/solution");
  };

  const handleResolve = () => {
    setIsCompleted(true);
  };

  const handleConfirm = () => {
    router.replace("/solution");
  };

  if (isCompleted) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
        <Header
          className="!bg-background"
          leftSlot={<HeaderBackButton onClick={handleBack} />}
          rightSlot={<div aria-hidden="true" className="size-10" />}
          title="해결 완료"
        />

        <section className="min-h-0 flex-1 overflow-y-auto px-6 pt-3">
          <article className="bg-background px-5 py-5 text-center border border-grayscale-100 rounded-2xl">
            <p className="text-title-sm text-grayscale-1000">
              월말 예상 잔액 변화
            </p>
            <p className="text-body-md mt-4 text-grayscale-1000">
              기존: -120,000원
            </p>

            <Image
              alt=""
              aria-hidden="true"
              className="mx-auto my-3 shrink-0"
              height={10}
              src="/icons/solution/bottom-arrow.svg"
              width={8}
            />

            <p className="text-title-md text-grayscale-1000">
              변경 후: 30,000원
            </p>
          </article>

          <section className="mt-6 text-center">
            <h1 className="text-title-sm text-grayscale-1000">
              월말 예상 잔액이 변화되었어요.
            </h1>
            <p className="text-body-md mt-1 text-grayscale-1000">
              이제 이번 달은 무리 없이 버틸 수 있어요
            </p>
          </section>
        </section>

        <BottomActionBar
          actionLabel="확인"
          bottomSpacing="compact"
          className="shrink-0 bg-background"
          onAction={handleConfirm}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <Header
        className="!bg-background"
        leftSlot={<HeaderBackButton onClick={handleBack} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="해결하기"
      />

      <section className="relative min-h-0 flex-1 overflow-hidden">
        <div className={getStepClassName(step === 0)} />

        <div
          className={`${getStepClassName(step > 0)} flex-col items-center pt-[31%]`}
        >
          <Image
            alt=""
            aria-hidden="true"
            height={180}
            priority
            src={SOLUTION_IMAGE_SRC}
            width={180}
          />

          <section className={getTextClassName(step === 2)}>
            <h1 className="text-display text-grayscale-1000">
              식비 5만원 줄이기
            </h1>
            <p className="text-body-md mt-1 text-grayscale-900">
              50,000원을 확보할 수 있어요
            </p>
          </section>
        </div>
      </section>

      <BottomActionBar
        actionLabel="이걸로 해결하기"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        onAction={handleResolve}
        onSecondary={handleSkip}
        secondaryClassName="text-caption mx-auto block text-grayscale-800"
        secondaryLabel="나중에 할게요"
      />
    </main>
  );
}
