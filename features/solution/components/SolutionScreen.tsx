"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { type RiskCause, weightRiskCauses } from "@/features/finance/api/riskDetail";
import { fetchSolution, sendActionFeedback } from "@/features/solution/api/solution";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";
import { formatWon } from "@/shared/ui/money";
import { Skeleton, SkeletonLines } from "@/shared/ui/Skeleton";
import { EmptyState, ErrorState, StaleNotice } from "@/shared/ui/StateMessage";

export function SolutionScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const fetcher = useCallback(() => fetchSolution(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const action = data?.action ?? null;
  const causes = weightRiskCauses(data?.causes ?? []);

  const handleResolve = () => {
    if (!action) return;
    // 사용자가 추천을 받아들였다는 신호. 실패해도 흐름을 막지 않는다.
    void sendActionFeedback(action.actionType, "ACCEPT");
    router.push("/solution/resolve");
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7">
        <h1 className="text-title-md text-grayscale-1000">솔루션</h1>

        <article className="mt-4 rounded-2xl bg-background px-5 py-5 shadow-2">
          {isInitialLoading ? (
            <>
              <Skeleton className="h-6 w-60" />
              <Skeleton className="mt-2 h-5 w-44" />
              <Skeleton className="mx-auto mt-8 size-[140px] rounded-2xl" />
              <Skeleton className="mt-8 h-13 w-full rounded-2xl" />
            </>
          ) : action ? (
            <>
              {/*
                이름은 별도 줄로 뺀다. 서버가 주는 title 은 그 자체로 완결된 문장이라
                "오태훈님 카드 결제일을 옮기면..." 처럼 앞에 붙이면 문장이 어색해진다.
              */}
              <p className="text-body-md text-grayscale-800">
                {user.displayName}님, 지금 이렇게 해보세요
              </p>
              <h2 className="text-title-md mt-1 text-grayscale-1000">
                {action.title}
              </h2>

              {/* 개선 예상 금액이 이 카드의 핵심 숫자다. 라벨 없이 두면 무슨 금액인지 알 수 없다. */}
              {action.estimatedImprovement > 0 ? (
                <div className="mt-4">
                  <p className="text-caption text-grayscale-700">
                    확보할 수 있는 금액
                  </p>
                  <p className="text-display tabular-nums text-grayscale-1000">
                    {formatWon(action.estimatedImprovement)}
                  </p>
                </div>
              ) : null}

              {action.description ? (
                <p className="text-body-md mt-2 text-grayscale-900">
                  {action.description}
                </p>
              ) : null}

              <div className="mt-8 flex justify-center">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={140}
                  priority
                  src="/icons/solution/food.svg"
                  width={140}
                />
              </div>

              <BottomActionButton
                className="mt-8"
                onClick={handleResolve}
                textStyle="title-sm"
              >
                지금 해결하기
              </BottomActionButton>

              {/* 규제상 필요한 경계 문구. 서버가 준 그대로 노출한다. */}
              {action.advisoryBoundary ? (
                <p className="text-caption mt-3 text-center text-grayscale-600">
                  {action.advisoryBoundary}
                </p>
              ) : null}
            </>
          ) : error ? (
            <ErrorState
              message="추천을 불러오지 못했어요"
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              description="지출 일정과 계좌를 연결하면 맞춤 솔루션을 찾아드려요"
              title="지금은 필요한 솔루션이 없어요"
            />
          )}
        </article>

        <section className="mt-6">
          <h2 className="text-title-md text-grayscale-1000">
            무엇이 부담이 되고 있나요
          </h2>

          {isInitialLoading ? (
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                  key={index}
                >
                  <SkeletonLines lines={2} />
                </div>
              ))}
            </div>
          ) : causes.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-grayscale-100 bg-background">
              <EmptyState title="분석할 지출 항목이 아직 없어요" />
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {causes.map((cause) => (
                <li key={cause.causeType}>
                  <CauseRow cause={cause} share={cause.share} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && action ? (
          <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
        ) : null}
      </section>

      <BottomNavigation />
    </main>
  );
}

function CauseRow({
  cause,
  share,
}: Readonly<{ cause: RiskCause; share: number }>) {
  return (
    <article className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-title-sm min-w-0 truncate text-grayscale-1000">
          {cause.label}
        </h3>
        <p className="text-title-sm tabular-nums shrink-0 text-grayscale-1000">
          {formatWon(-Math.abs(cause.impactAmount))}
        </p>
      </div>

      {/* 비중을 막대로도 보여준다. 금액만으로는 항목 간 크기 차이가 즉시 읽히지 않는다. */}
      <div
        aria-hidden="true"
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-grayscale-100"
      >
        <div
          className="h-full rounded-full bg-yellow-400"
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </div>

      {cause.reason ? (
        <p className="text-body-md mt-2 text-grayscale-900">{cause.reason}</p>
      ) : null}
    </article>
  );
}
