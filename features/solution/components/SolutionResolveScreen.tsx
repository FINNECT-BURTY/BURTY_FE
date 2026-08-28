"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  executeAction,
  fetchSolution,
  sendActionFeedback,
} from "@/features/solution/api/solution";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { formatWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/StateMessage";

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
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const fetcher = useCallback(() => fetchSolution(), []);
  const { data, isInitialLoading, refetch } = useBackendQuery(fetcher);
  const action = data?.action ?? null;

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
    // 거절도 추천 품질에 반영한다. 실패해도 화면 이동은 막지 않는다.
    if (action) void sendActionFeedback(action.actionType, "REJECT");
    router.replace("/solution");
  };

  /**
   * 실제로 액션을 실행한다.
   *
   * <p>예전에는 화면 상태만 "완료" 로 바꾸고 서버에는 아무것도 보내지 않았다.
   * 사용자는 조치가 끝난 줄 알지만 실제로는 아무 일도 일어나지 않았다.
   */
  const handleResolve = async () => {
    if (!action || isExecuting) return;

    setIsExecuting(true);
    setExecuteError(null);

    try {
      const result = await executeAction(action.actionType);

      if (result && result.executed === false) {
        // 서버가 실행하지 못했다고 답했다. 완료 화면으로 넘기면 거짓말이 된다.
        setExecuteError(result.message?.trim() || "지금은 실행할 수 없어요");
        return;
      }

      setIsCompleted(true);
    } catch {
      setExecuteError("실행에 실패했어요. 잠시 후 다시 시도해주세요");
    } finally {
      setIsExecuting(false);
    }
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
          <article className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5 text-center">
            <p className="text-title-sm text-grayscale-1000">
              확보한 금액
            </p>
            <p className="text-display tabular-nums mt-2 text-grayscale-1000">
              {action ? formatWon(action.estimatedImprovement) : "-"}
            </p>
            {/*
              변경 후 잔액을 여기서 계산하지 않는다. 예측은 서버가 다시 만들어야
              하는 값이고, 화면에서 임의로 더해 보여주면 실제와 어긋난다.
            */}
            <p className="text-caption mt-2 text-grayscale-600">
              반영된 예측은 자산 화면에서 확인할 수 있어요
            </p>
          </article>

          <section className="mt-6 text-center">
            <h1 className="text-title-sm text-grayscale-1000">
              조치가 반영되었어요
            </h1>
            <p className="text-body-md mt-1 text-grayscale-900">
              이제 이번 달은 무리 없이 버틸 수 있어요
            </p>
          </section>
        </section>

        <BottomActionBar
          actionLabel="확인"
          actionTextStyle="title-sm"
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
            {isInitialLoading ? (
              <>
                <Skeleton className="mx-auto h-7 w-52" />
                <Skeleton className="mx-auto mt-2 h-5 w-40" />
              </>
            ) : action ? (
              <>
                <h1 className="text-display px-6 text-grayscale-1000">
                  {action.title}
                </h1>
                <p className="text-body-md mt-1 text-grayscale-900">
                  {formatWon(action.estimatedImprovement)}을 확보할 수 있어요
                </p>
              </>
            ) : (
              <ErrorState
                message="추천을 불러오지 못했어요"
                onRetry={refetch}
              />
            )}
          </section>
        </div>
      </section>

      {executeError ? (
        <p
          className="text-body-md px-6 pb-2 text-center text-red"
          role="alert"
        >
          {executeError}
        </p>
      ) : null}

      <BottomActionBar
        actionLabel={isExecuting ? "처리 중..." : "이걸로 해결하기"}
        actionTextStyle="title-sm"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        disabled={!action || isExecuting}
        onAction={handleResolve}
        onSecondary={handleSkip}
        secondaryClassName="text-caption mx-auto block text-grayscale-800"
        secondaryLabel="나중에 할게요"
      />
    </main>
  );
}
