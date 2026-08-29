"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  classifyTransfer,
  fetchTransferOverview,
  type Transfer,
  type TransferOutcome,
  transferOutcomeLabel,
} from "@/features/transfer/api/transfer";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { formatWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, StaleNotice } from "@/shared/ui/StateMessage";

/** 상태 배지 색. 결과가 정해지지 않은 건을 성공·실패 어느 쪽으로도 물들이지 않는다. */
const outcomeToneClassNames: Record<TransferOutcome, string> = {
  completed: "bg-green/10 text-green",
  pending: "bg-grayscale-100 text-grayscale-800",
  rejected: "bg-red/10 text-red",
  unknown: "bg-orange/10 text-orange",
};

export function TransferScreen() {
  const router = useRouter();

  const fetcher = useCallback(() => fetchTransferOverview(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const limit = data?.limit ?? null;
  const transfers = data?.transfers ?? [];

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="이체"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {/* 하루 한도 — 보내기 전에 알아야 하는 값이다 */}
        <section className="rounded-2xl bg-background px-5 py-5 shadow-2">
          <p className="text-body-md text-grayscale-800">하루 이체 한도</p>
          {isInitialLoading ? (
            <Skeleton className="mt-2 h-7 w-40" />
          ) : (
            <p className="text-display tabular-nums mt-1 text-grayscale-1000">
              {limit ? formatWon(limit.limit) : "-"}
            </p>
          )}
          <p className="text-caption mt-2 text-grayscale-600">
            한도는 마이페이지에서 바꿀 수 있어요
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-title-md text-grayscale-1000">최근 이체</h2>

          {isInitialLoading ? (
            <div className="mt-3 space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                  key={index}
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              ))}
            </div>
          ) : transfers.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-grayscale-100 bg-background">
              <EmptyState
                description="아래 버튼으로 첫 이체를 보내보세요"
                title="아직 보낸 이체가 없어요"
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {transfers.map((transfer) => (
                <li key={transfer.transferId}>
                  <TransferRow transfer={transfer} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {error ? (
          <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
        ) : null}
      </section>

      <BottomActionBar
        actionLabel="이체하기"
        actionTextStyle="title-sm"
        bottomSpacing="compact"
        className="shrink-0 bg-background"
        onAction={() => router.push("/transfer/new")}
      />
    </main>
  );
}

function TransferRow({ transfer }: Readonly<{ transfer: Transfer }>) {
  const outcome = classifyTransfer(transfer.status);

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-5">
      <div className="min-w-0">
        <p className="text-title-xs truncate text-grayscale-1000">
          {transfer.transferId}
        </p>
        {transfer.familyNotified ? (
          <p className="text-caption mt-0.5 text-grayscale-600">보호자에게 알림</p>
        ) : null}
      </div>

      <span
        className={`text-caption shrink-0 rounded-full px-2.5 py-1 font-medium ${outcomeToneClassNames[outcome]}`}
      >
        {transferOutcomeLabel(outcome)}
      </span>
    </article>
  );
}
