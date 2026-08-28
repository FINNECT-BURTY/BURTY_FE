"use client";

import { useCallback, useMemo, useState } from "react";

import {
  type CashflowSchedule,
  scheduleDirection,
  signedScheduleAmount,
} from "@/features/finance/api/assetFlow";
import {
  deactivateSchedule,
  fetchSchedules,
} from "@/features/mypage/api/settings";
import { SettingsScreenShell } from "@/features/mypage/ui/SettingsScreenShell";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";
import { formatSignedWon } from "@/shared/ui/money";
import { StaleNotice } from "@/shared/ui/StateMessage";

export function FixedExpenseScreen() {
  const fetcher = useCallback(() => fetchSchedules(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  const [pendingRemove, setPendingRemove] = useState<CashflowSchedule | null>(
    null,
  );
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // 날짜순으로 보여준다. 고정 지출은 "언제 빠져나가는가" 가 핵심이다.
  const schedules = useMemo(
    () =>
      (data ?? [])
        .filter((item) => item.active)
        .slice()
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth),
    [data],
  );

  const handleRemove = async () => {
    if (!pendingRemove || isRemoving) return;

    setIsRemoving(true);
    setRemoveError(null);

    try {
      await deactivateSchedule(pendingRemove.scheduleId);
      setPendingRemove(null);
      refetch();
    } catch {
      setRemoveError("삭제에 실패했어요. 잠시 후 다시 시도해주세요");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <SettingsScreenShell
      description="여기 등록된 일정으로 이번 달 잔액을 예측해요. 지우면 예측도 함께 바뀝니다."
      emptyDescription="급여일과 고정 지출을 등록하면 흐름을 더 정확히 예측해요"
      emptyTitle="등록된 고정 일정이 없어요"
      errorMessage="일정을 불러오지 못했어요"
      hasError={Boolean(error)}
      isEmpty={schedules.length === 0}
      isInitialLoading={isInitialLoading}
      onRetry={refetch}
      title="고정 지출 관리"
    >
      <ul className="space-y-3">
        {schedules.map((schedule) => {
          const direction = scheduleDirection(schedule);

          return (
            <li
              className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
              key={schedule.scheduleId}
            >
              <div className="min-w-0">
                <p className="text-title-sm truncate text-grayscale-1000">
                  {schedule.label}
                </p>
                <p className="text-caption mt-0.5 text-grayscale-600">
                  매월 {schedule.dayOfMonth}일
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <p
                  className={`text-body-md tabular-nums ${
                    direction === "in" ? "text-green" : "text-grayscale-1000"
                  }`}
                >
                  {formatSignedWon(signedScheduleAmount(schedule))}
                </p>
                <button
                  aria-label={`${schedule.label} 일정 삭제`}
                  className="text-body-md rounded-full border border-grayscale-200 px-3 py-1.5 text-grayscale-800 active:bg-grayscale-100"
                  onClick={() => {
                    setRemoveError(null);
                    setPendingRemove(schedule);
                  }}
                  type="button"
                >
                  삭제
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {removeError ? (
        <p className="text-body-md mt-4 text-red" role="alert">
          {removeError}
        </p>
      ) : null}

      {error ? (
        <StaleNotice className="mt-6 justify-center" onRetry={refetch} />
      ) : null}

      {pendingRemove ? (
        <ConfirmModal
          onPrimary={handleRemove}
          onSecondary={() => {
            if (isRemoving) return;
            setPendingRemove(null);
          }}
          primaryDisabled={isRemoving}
          primaryLabel={isRemoving ? "삭제 중..." : "삭제"}
          secondaryLabel="취소"
          title={`'${pendingRemove.label}' 일정을 삭제할까요?\n이번 달 예측에서 빠집니다.`}
        />
      ) : null}
    </SettingsScreenShell>
  );
}
