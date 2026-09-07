"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  budgetLabel,
  type BudgetStatus,
  budgetTone,
  deactivateBudget,
  fetchBudgets,
  isTotalBudget,
  sortBudgets,
  upsertBudget,
} from "@/features/budget/api/budgets";
import { BudgetBar } from "@/features/budget/components/BudgetBar";
import {
  BudgetForm,
  type BudgetFormValue,
} from "@/features/budget/components/BudgetForm";
import { describeApiError } from "@/shared/api/apiResponse";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { formatWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/StateMessage";

type Mode = { kind: "closed" } | { kind: "edit"; status: BudgetStatus } | { kind: "new" };

export function BudgetScreen() {
  const router = useRouter();

  const fetcher = useCallback(() => fetchBudgets(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const [mode, setMode] = useState<Mode>({ kind: "closed" });
  const [pendingDelete, setPendingDelete] = useState<BudgetStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const budgets = sortBudgets(data ?? []);
  const isEmpty = !isInitialLoading && budgets.length === 0;
  const takenCategories = budgets.map((item) => item.categoryCode ?? "");

  const runAction = async (action: () => Promise<unknown>) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await action();
      setMode({ kind: "closed" });
      setPendingDelete(null);
      refetch();
    } catch (caught) {
      // 실패를 조용히 삼키면 저장된 줄 알고 화면을 떠난다.
      setActionError(describeApiError(caught));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (value: BudgetFormValue) =>
    void runAction(() =>
      upsertBudget({
        alertThresholdPercent: value.alertThresholdPercent,
        amount: value.amount,
        categoryCode: value.categoryCode,
      }),
    );

  const handleDelete = () => {
    if (!pendingDelete) return;
    void runAction(() => deactivateBudget(pendingDelete.budgetId));
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="예산"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {isInitialLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                key={index}
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-2 w-full" />
              </div>
            ))}
          </div>
        ) : error && isEmpty ? (
          <ErrorState message="예산을 불러오지 못했어요" onRetry={refetch} />
        ) : (
          <>
            {isEmpty && mode.kind === "closed" ? (
              <EmptyState
                description="한 달에 얼마까지 쓸지 정해두면 넘기 전에 알려드려요"
                title="아직 정한 예산이 없어요"
              />
            ) : null}

            {budgets.length > 0 ? (
              <ul className="space-y-2">
                {budgets.map((item) => (
                  <li key={item.budgetId}>
                    <BudgetCard
                      onDelete={() => setPendingDelete(item)}
                      onEdit={() => setMode({ kind: "edit", status: item })}
                      status={item}
                    />
                  </li>
                ))}
              </ul>
            ) : null}

            {actionError ? (
              <p
                className="text-body-md mt-3 text-red"
                role="alert"
              >
                {actionError}
              </p>
            ) : null}

            {mode.kind === "closed" ? (
              <button
                className="text-title-sm mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl border border-dashed border-grayscale-300 bg-background text-grayscale-800"
                onClick={() => setMode({ kind: "new" })}
                type="button"
              >
                예산 추가
              </button>
            ) : (
              <div className="mt-3">
                <BudgetForm
                  editing={mode.kind === "edit" ? mode.status : null}
                  isSubmitting={isSubmitting}
                  onCancel={() => {
                    setMode({ kind: "closed" });
                    setActionError(null);
                  }}
                  onSubmit={handleSubmit}
                  takenCategories={takenCategories}
                />
              </div>
            )}
          </>
        )}
      </section>

      {pendingDelete ? (
        <ConfirmModal
          onPrimary={handleDelete}
          onSecondary={() => setPendingDelete(null)}
          primaryDisabled={isSubmitting}
          primaryLabel="해제"
          secondaryLabel="취소"
          title={`${budgetLabel(pendingDelete)} 예산을\n해제할까요?`}
        />
      ) : null}
    </main>
  );
}

function BudgetCard({
  onDelete,
  onEdit,
  status,
}: Readonly<{
  onDelete: () => void;
  onEdit: () => void;
  status: BudgetStatus;
}>) {
  const tone = budgetTone(status);
  const label = budgetLabel(status);

  return (
    <article
      className={`rounded-2xl border bg-background px-5 py-5 ${
        status.exceeded ? "border-red" : "border-grayscale-100"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-title-sm min-w-0 truncate text-grayscale-1000">
          {label}
          {isTotalBudget(status) ? null : (
            <span className="text-caption ml-1.5 text-grayscale-600">
              카테고리
            </span>
          )}
        </h2>
        <span
          className={`text-caption shrink-0 ${
            tone === "danger"
              ? "text-red"
              : tone === "warning"
                ? "text-orange"
                : "text-grayscale-600"
          }`}
        >
          {status.usagePercent}%
        </span>
      </div>

      <BudgetBar tone={tone} usagePercent={status.usagePercent} />

      <p className="text-body-md mt-3 text-grayscale-800">
        {formatWon(status.spentAmount)} / {formatWon(status.budgetAmount)}
      </p>
      <p
        className={`text-body-md mt-0.5 ${
          status.exceeded ? "text-red" : "text-grayscale-700"
        }`}
      >
        {status.exceeded
          ? `${formatWon(Math.abs(status.remainingAmount))} 넘게 썼어요`
          : `${formatWon(status.remainingAmount)} 남았어요`}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          className="text-body-md h-10 flex-1 rounded-xl border border-grayscale-200 text-grayscale-800"
          onClick={onEdit}
          type="button"
        >
          수정
        </button>
        <button
          className="text-body-md h-10 flex-1 rounded-xl border border-grayscale-200 text-grayscale-700"
          onClick={onDelete}
          type="button"
        >
          해제
        </button>
      </div>
    </article>
  );
}
